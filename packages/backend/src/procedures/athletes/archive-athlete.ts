import { z } from "zod";
import { createAthleteRepository } from "../../infrastructure/repositories/athlete.repository";
import { authProcedure } from "../../lib/orpc";
import { makeArchiveAthlete } from "../../use-cases/athletes/archive-athlete";

/**
 * Archive athlete procedure
 * Soft delete - sets status to inactive
 * Requires authentication and organization context
 */
export const archiveAthlete = authProcedure
	.input(z.object({ athleteId: z.string() }))
	.output(z.object({ success: z.boolean() }))
	.errors({
		FORBIDDEN: { message: "No tienes permisos para archivar atletas" },
		NOT_FOUND: { message: "Atleta no encontrado" },
	})
	.handler(async ({ input, context, errors }) => {
		const useCase = makeArchiveAthlete({
			athleteRepository: createAthleteRepository(context.db),
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
				case "not_found":
					throw errors.NOT_FOUND();
				case "repository_error":
					console.error("Repository error:", result.error.message);
					throw new Error("Internal error");
			}
		}

		return { success: true };
	});
