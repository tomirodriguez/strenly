import {
	createExercise,
	type Exercise,
	type ExerciseRepositoryPort,
	hasPermission,
	type MovementPattern,
	type MuscleGroup,
	type OrganizationContext,
	type Role,
} from "@strenly/core";
import { errAsync, type ResultAsync } from "neverthrow";

export type CreateExerciseInput = OrganizationContext & {
	memberRole: Role;
	name: string;
	description?: string | null;
	instructions?: string | null;
	videoUrl?: string | null;
	movementPattern?: MovementPattern | null;
	isUnilateral?: boolean;
	primaryMuscles?: MuscleGroup[];
	secondaryMuscles?: MuscleGroup[];
};

export type CreateExerciseError =
	| { type: "forbidden"; message: string }
	| { type: "validation_error"; message: string }
	| { type: "repository_error"; message: string };

type Dependencies = {
	exerciseRepository: ExerciseRepositoryPort;
	generateId: () => string;
};

export const makeCreateExercise =
	(deps: Dependencies) =>
	(input: CreateExerciseInput): ResultAsync<Exercise, CreateExerciseError> => {
		// 1. Authorization FIRST
		if (!hasPermission(input.memberRole, "exercises:write")) {
			return errAsync({
				type: "forbidden",
				message: "No permission to create exercises",
			});
		}

		// 2. Domain validation - custom exercises MUST have organizationId
		const exerciseResult = createExercise({
			id: deps.generateId(),
			organizationId: input.organizationId,
			name: input.name,
			description: input.description,
			instructions: input.instructions,
			videoUrl: input.videoUrl,
			movementPattern: input.movementPattern,
			isUnilateral: input.isUnilateral,
			primaryMuscles: input.primaryMuscles,
			secondaryMuscles: input.secondaryMuscles,
		});

		if (exerciseResult.isErr()) {
			return errAsync({
				type: "validation_error",
				message: exerciseResult.error.message,
			});
		}

		// 3. Persist
		return deps.exerciseRepository.create(exerciseResult.value).mapErr(
			(e): CreateExerciseError => ({
				type: "repository_error",
				message: e.type === "DATABASE_ERROR" ? e.message : `Exercise not found: ${e.exerciseId}`,
			}),
		);
	};
