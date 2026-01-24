import { athleteSchema, athleteStatusSchema, genderSchema, updateAthleteInputSchema } from "@strenly/contracts/athletes/athlete";
import { createAthleteRepository } from "../../infrastructure/repositories/athlete.repository";
import { authProcedure } from "../../lib/orpc";
import { makeUpdateAthlete } from "../../use-cases/athletes/update-athlete";

/**
 * Update athlete procedure
 * Requires authentication and organization context
 */
export const updateAthlete = authProcedure
	.input(updateAthleteInputSchema)
	.output(athleteSchema)
	.errors({
		FORBIDDEN: { message: "No tienes permisos para actualizar atletas" },
		NOT_FOUND: { message: "Atleta no encontrado" },
		VALIDATION_ERROR: { message: "Datos de atleta invalidos" },
	})
	.handler(async ({ input, context, errors }) => {
		const useCase = makeUpdateAthlete({
			athleteRepository: createAthleteRepository(context.db),
		});

		// Parse gender from optional string to enum
		const gender = input.gender !== undefined ? (input.gender ? genderSchema.parse(input.gender) : null) : undefined;

		// Parse status from optional string to enum
		const status = input.status ? athleteStatusSchema.parse(input.status) : undefined;

		const result = await useCase({
			organizationId: context.organization.id,
			userId: context.user.id,
			memberRole: context.membership.role,
			athleteId: input.athleteId,
			name: input.name,
			email: input.email !== undefined ? (input.email ?? null) : undefined,
			phone: input.phone !== undefined ? (input.phone ?? null) : undefined,
			birthdate: input.birthdate !== undefined ? (input.birthdate ? new Date(input.birthdate) : null) : undefined,
			gender,
			notes: input.notes !== undefined ? (input.notes ?? null) : undefined,
			status,
		});

		if (result.isErr()) {
			// Exhaustive error mapping
			switch (result.error.type) {
				case "forbidden":
					throw errors.FORBIDDEN();
				case "not_found":
					throw errors.NOT_FOUND();
				case "validation_error":
					throw errors.VALIDATION_ERROR();
				case "repository_error":
					console.error("Repository error:", result.error.message);
					throw new Error("Internal error");
			}
		}

		const athlete = result.value;

		return {
			id: athlete.id,
			organizationId: athlete.organizationId,
			name: athlete.name,
			email: athlete.email,
			phone: athlete.phone,
			birthdate: athlete.birthdate?.toISOString().split("T")[0] ?? null,
			gender: athlete.gender,
			notes: athlete.notes,
			status: athlete.status,
			linkedUserId: athlete.linkedUserId,
			isLinked: athlete.linkedUserId !== null,
			createdAt: athlete.createdAt.toISOString(),
			updatedAt: athlete.updatedAt.toISOString(),
		};
	});
