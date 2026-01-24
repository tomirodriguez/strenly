import { listExercisesInputSchema, listExercisesOutputSchema } from "@strenly/contracts/exercises";
import { createExerciseRepository } from "../../infrastructure/repositories/exercise.repository";
import { authProcedure } from "../../lib/orpc";
import { makeListExercises } from "../../use-cases/exercises/list-exercises";

/**
 * List exercises (curated + organization custom)
 * Requires authentication and exercises:read permission
 */
export const listExercises = authProcedure
	.errors({
		FORBIDDEN: { message: "No permission to list exercises" },
	})
	.input(listExercisesInputSchema)
	.output(listExercisesOutputSchema)
	.handler(async ({ input, context, errors }) => {
		const listExercisesUseCase = makeListExercises({
			exerciseRepository: createExerciseRepository(context.db),
		});

		const result = await listExercisesUseCase({
			organizationId: context.organization.id,
			userId: context.user.id,
			memberRole: context.membership.role,
			movementPattern: input.movementPattern,
			muscleGroup: input.muscleGroup,
			search: input.search,
			includeArchived: input.includeArchived,
			limit: input.limit,
			offset: input.offset,
		});

		if (result.isErr()) {
			switch (result.error.type) {
				case "forbidden":
					throw errors.FORBIDDEN({ message: result.error.message });
				case "repository_error":
					console.error("Repository error:", result.error.message);
					throw new Error("Internal error");
			}
		}

		const { items, totalCount } = result.value;

		return {
			items: items.map((exercise) => ({
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
			})),
			totalCount,
		};
	});
