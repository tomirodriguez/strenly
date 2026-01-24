import { generateInvitationOutputSchema } from "@strenly/contracts/athletes/invitation";
import { z } from "zod";
import { createAthleteRepository } from "../../infrastructure/repositories/athlete.repository";
import { createAthleteInvitationRepository } from "../../infrastructure/repositories/athlete-invitation.repository";
import { authProcedure } from "../../lib/orpc";
import { makeGenerateInvitation } from "../../use-cases/athletes/generate-invitation";

/**
 * Generate an invitation for an athlete
 * Requires authentication and organization context
 * Revokes any existing active invitation
 */
export const generateInvitation = authProcedure
	.input(z.object({ athleteId: z.string() }))
	.output(generateInvitationOutputSchema)
	.errors({
		FORBIDDEN: { message: "No tienes permisos para generar invitaciones" },
		ATHLETE_NOT_FOUND: { message: "Atleta no encontrado" },
		ALREADY_LINKED: { message: "El atleta ya esta vinculado a una cuenta" },
	})
	.handler(async ({ input, context, errors }) => {
		const useCase = makeGenerateInvitation({
			athleteRepository: createAthleteRepository(context.db),
			invitationRepository: createAthleteInvitationRepository(context.db),
			generateId: () => crypto.randomUUID(),
			appUrl: process.env.APP_URL ?? "http://localhost:3000",
		});

		const result = await useCase({
			organizationId: context.organization.id,
			userId: context.user.id,
			memberRole: context.membership.role,
			athleteId: input.athleteId,
		});

		if (result.isErr()) {
			// Exhaustive error mapping
			switch (result.error.type) {
				case "forbidden":
					throw errors.FORBIDDEN();
				case "athlete_not_found":
					throw errors.ATHLETE_NOT_FOUND();
				case "already_linked":
					throw errors.ALREADY_LINKED();
				case "repository_error":
					console.error("Repository error:", result.error.message);
					throw new Error("Internal error");
			}
		}

		return {
			invitationUrl: result.value.invitationUrl,
		};
	});
