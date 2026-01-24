import { exerciseSchema, getExerciseInputSchema } from "@strenly/contracts/exercises";
import { createExerciseRepository } from "../../infrastructure/repositories/exercise.repository";
import { authProcedure } from "../../lib/orpc";
import { makeGetExercise } from "../../use-cases/exercises/get-exercise";

/**
 * Get a single exercise by ID
 * Requires authentication and exercises:read permission
 * Returns curated or organization's custom exercises
 */
export const getExercise = authProcedure
	.errors({
		FORBIDDEN: { message: "No permission to view exercises" },
		NOT_FOUND: { message: "Exercise not found" },
	})
	.input(getExerciseInputSchema)
	.output(exerciseSchema)
	.handler(async ({ input, context, errors }) => {
		const getExerciseUseCase = makeGetExercise({
			exerciseRepository: createExerciseRepository(context.db),
		});

		const result = await getExerciseUseCase({
			organizationId: context.organization.id,
			userId: context.user.id,
			memberRole: context.membership.role,
			exerciseId: input.exerciseId,
		});

		if (result.isErr()) {
			switch (result.error.type) {
				case "forbidden":
					throw errors.FORBIDDEN({ message: result.error.message });
				case "not_found":
					throw errors.NOT_FOUND({ message: `Exercise not found: ${result.error.exerciseId}` });
				case "repository_error":
					console.error("Repository error:", result.error.message);
					throw new Error("Internal error");
			}
		}

		const exercise = result.value;

		return {
			id: exercise.id,
			organizationId: exercise.organizationId,
			name: exercise.name,
			description: exercise.description,
			instructions: exercise.instructions,
			videoUrl: exercise.videoUrl,
			movementPattern: exercise.movementPattern,
			isUnilateral: exercise.isUnilateral,
			isCurated: exercise.organizationId === null,
			clonedFromId: exercise.clonedFromId,
			primaryMuscles: [...exercise.primaryMuscles],
			secondaryMuscles: [...exercise.secondaryMuscles],
			archivedAt: exercise.archivedAt?.toISOString() ?? null,
			createdAt: exercise.createdAt.toISOString(),
			updatedAt: exercise.updatedAt.toISOString(),
		};
	});
