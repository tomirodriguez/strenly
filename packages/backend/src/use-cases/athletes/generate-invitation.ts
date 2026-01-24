import {
	type AthleteInvitation,
	type AthleteInvitationRepositoryPort,
	type AthleteRepositoryPort,
	createAthleteInvitation,
	hasPermission,
	type OrganizationContext,
} from "@strenly/core";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

export type GenerateInvitationInput = OrganizationContext & {
	athleteId: string;
};

export type GenerateInvitationResult = {
	invitation: AthleteInvitation;
	invitationUrl: string;
};

export type GenerateInvitationError =
	| { type: "forbidden"; message: string }
	| { type: "athlete_not_found"; athleteId: string }
	| { type: "already_linked"; athleteId: string; message: string }
	| { type: "repository_error"; message: string };

type Dependencies = {
	athleteRepository: AthleteRepositoryPort;
	invitationRepository: AthleteInvitationRepositoryPort;
	generateId: () => string;
	appUrl: string;
};

export const makeGenerateInvitation =
	(deps: Dependencies) =>
	(input: GenerateInvitationInput): ResultAsync<GenerateInvitationResult, GenerateInvitationError> => {
		// 1. Authorization FIRST
		if (!hasPermission(input.memberRole, "athletes:write")) {
			return errAsync({
				type: "forbidden",
				message: "No permission to generate athlete invitations",
			});
		}

		const ctx: OrganizationContext = {
			organizationId: input.organizationId,
			userId: input.userId,
			memberRole: input.memberRole,
		};

		// 2. Fetch athlete
		return deps.athleteRepository
			.findById(ctx, input.athleteId)
			.mapErr((e): GenerateInvitationError => {
				if (e.type === "NOT_FOUND") {
					return { type: "athlete_not_found", athleteId: input.athleteId };
				}
				return { type: "repository_error", message: e.type === "DATABASE_ERROR" ? e.message : `Unknown error` };
			})
			.andThen((athlete) => {
				// 3. Check if already linked
				if (athlete.linkedUserId !== null) {
					return errAsync<AthleteInvitation, GenerateInvitationError>({
						type: "already_linked",
						athleteId: input.athleteId,
						message: "Athlete is already linked to a user account",
					});
				}

				// 4. Revoke existing invitations if any
				return deps.invitationRepository
					.findByAthleteId(ctx, input.athleteId)
					.mapErr(
						(e): GenerateInvitationError => ({
							type: "repository_error",
							message: e.type === "DATABASE_ERROR" ? e.message : `Invitation error`,
						}),
					)
					.andThen((existingInvitation) => {
						if (existingInvitation !== null) {
							return deps.invitationRepository.revoke(ctx, existingInvitation.id).mapErr(
								(e): GenerateInvitationError => ({
									type: "repository_error",
									message: e.type === "DATABASE_ERROR" ? e.message : `Failed to revoke invitation`,
								}),
							);
						}
						return okAsync(undefined);
					})
					.andThen(() => {
						// 5. Create new invitation
						const invitation = createAthleteInvitation({
							id: deps.generateId(),
							athleteId: input.athleteId,
							organizationId: input.organizationId,
							createdByUserId: input.userId,
						});

						// 6. Persist
						return deps.invitationRepository.create(ctx, invitation).mapErr(
							(e): GenerateInvitationError => ({
								type: "repository_error",
								message: e.type === "DATABASE_ERROR" ? e.message : `Failed to create invitation`,
							}),
						);
					});
			})
			.map((invitation) => ({
				// 7. Build URL and return
				invitation,
				invitationUrl: `${deps.appUrl}/invite/${invitation.token}`,
			}));
	};
