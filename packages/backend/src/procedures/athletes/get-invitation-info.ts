import { invitationInfoSchema } from "@strenly/contracts/athletes/invitation";
import { z } from "zod";
import { createAthleteInvitationRepository } from "../../infrastructure/repositories/athlete-invitation.repository";
import { createOrganizationLookup } from "../../infrastructure/services/organization-lookup";
import { publicProcedure } from "../../lib/orpc";
import { makeGetInvitationInfo } from "../../use-cases/athletes/get-invitation-info";

/**
 * Get invitation info by token
 * PUBLIC endpoint - no authentication required
 * Used to display invitation details on the acceptance page
 */
export const getInvitationInfo = publicProcedure
	.input(z.object({ token: z.string() }))
	.output(invitationInfoSchema)
	.errors({
		INVALID_TOKEN: { message: "Token de invitacion invalido" },
	})
	.handler(async ({ input, context, errors }) => {
		const useCase = makeGetInvitationInfo({
			invitationRepository: createAthleteInvitationRepository(context.db),
			organizationLookup: createOrganizationLookup(context.db),
		});

		const result = await useCase({
			token: input.token,
		});

		if (result.isErr()) {
			// Exhaustive error mapping
			switch (result.error.type) {
				case "invalid_token":
					throw errors.INVALID_TOKEN();
				case "repository_error":
					console.error("Repository error:", result.error.message);
					throw new Error("Internal error");
			}
		}

		return {
			athleteName: result.value.athleteName,
			organizationName: result.value.organizationName,
			coachName: result.value.coachName,
			expiresAt: result.value.expiresAt.toISOString(),
			isValid: result.value.isValid,
		};
	});
