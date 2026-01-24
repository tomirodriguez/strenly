import {
	type Exercise,
	type ExerciseRepositoryPort,
	hasPermission,
	isCurated,
	type OrganizationContext,
	type Role,
} from "@strenly/core";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

export type GetExerciseInput = OrganizationContext & {
	memberRole: Role;
	exerciseId: string;
};

export type GetExerciseError =
	| { type: "forbidden"; message: string }
	| { type: "not_found"; exerciseId: string }
	| { type: "repository_error"; message: string };

type Dependencies = {
	exerciseRepository: ExerciseRepositoryPort;
};

export const makeGetExercise =
	(deps: Dependencies) =>
	(input: GetExerciseInput): ResultAsync<Exercise, GetExerciseError> => {
		// 1. Authorization FIRST
		if (!hasPermission(input.memberRole, "exercises:read")) {
			return errAsync({
				type: "forbidden",
				message: "No permission to view exercises",
			});
		}

		// 2. Fetch exercise
		return deps.exerciseRepository
			.findById(input.exerciseId)
			.mapErr(
				(e): GetExerciseError =>
					e.type === "NOT_FOUND"
						? { type: "not_found", exerciseId: input.exerciseId }
						: { type: "repository_error", message: e.message },
			)
			.andThen((exercise) => {
				// 3. Verify access - exercise is curated OR belongs to org
				if (!isCurated(exercise) && exercise.organizationId !== input.organizationId) {
					return errAsync<Exercise, GetExerciseError>({
						type: "not_found",
						exerciseId: input.exerciseId,
					});
				}

				return okAsync<Exercise, GetExerciseError>(exercise);
			});
	};
