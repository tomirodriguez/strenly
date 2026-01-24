import {
	hasPermission,
	isCurated,
	type ExerciseRepositoryPort,
	type OrganizationContext,
	type Role,
} from "@strenly/core";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

export type ArchiveExerciseInput = OrganizationContext & {
	memberRole: Role;
	exerciseId: string;
};

export type ArchiveExerciseError =
	| { type: "forbidden"; message: string }
	| { type: "not_found"; exerciseId: string }
	| { type: "cannot_archive_curated"; message: string }
	| { type: "repository_error"; message: string };

type Dependencies = {
	exerciseRepository: ExerciseRepositoryPort;
};

export const makeArchiveExercise =
	(deps: Dependencies) =>
	(input: ArchiveExerciseInput): ResultAsync<void, ArchiveExerciseError> => {
		// 1. Authorization FIRST
		if (!hasPermission(input.memberRole, "exercises:write")) {
			return errAsync({
				type: "forbidden",
				message: "No permission to archive exercises",
			});
		}

		// 2. Fetch exercise to verify ownership
		return deps.exerciseRepository
			.findById(input.exerciseId)
			.mapErr(
				(e): ArchiveExerciseError =>
					e.type === "NOT_FOUND"
						? { type: "not_found", exerciseId: input.exerciseId }
						: { type: "repository_error", message: e.message },
			)
			.andThen((exercise) => {
				// 3. Check if archivable - cannot archive curated or other org's exercises
				if (isCurated(exercise)) {
					return errAsync<void, ArchiveExerciseError>({
						type: "cannot_archive_curated",
						message: "Cannot archive curated exercises",
					});
				}

				if (exercise.organizationId !== input.organizationId) {
					return errAsync<void, ArchiveExerciseError>({
						type: "not_found",
						exerciseId: input.exerciseId,
					});
				}

				// 4. Archive the exercise (soft delete via archivedAt timestamp)
				return deps.exerciseRepository.archive(input.exerciseId).mapErr(
					(e): ArchiveExerciseError => ({
						type: "repository_error",
						message: e.type === "DATABASE_ERROR" ? e.message : `Exercise not found: ${e.exerciseId}`,
					}),
				);
			});
	};
