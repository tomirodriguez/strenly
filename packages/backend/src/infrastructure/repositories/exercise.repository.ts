import type { ExerciseRepositoryError, ExerciseRepositoryPort, ListExercisesOptions } from "@strenly/core";
import { createExercise, type Exercise, isValidMovementPattern, type MuscleGroup, isValidMuscleGroup } from "@strenly/core";
import type { DbClient } from "@strenly/database";
import { exerciseMuscles, exercises, muscleGroups } from "@strenly/database/schema";
import { and, count, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { err, ok, ResultAsync } from "neverthrow";

function wrapDbError(error: unknown): ExerciseRepositoryError {
	console.error("Exercise repository error:", error);
	return { type: "DATABASE_ERROR", message: "Database operation failed" };
}

type ExerciseRow = typeof exercises.$inferSelect;
type MuscleMapping = { muscleGroupId: string; isPrimary: boolean };

/**
 * Fetch muscle mappings for an exercise
 */
async function fetchMuscleMappings(db: DbClient, exerciseId: string): Promise<MuscleMapping[]> {
	const results = await db
		.select({
			muscleGroupId: exerciseMuscles.muscleGroupId,
			isPrimary: exerciseMuscles.isPrimary,
		})
		.from(exerciseMuscles)
		.where(eq(exerciseMuscles.exerciseId, exerciseId));

	return results;
}

/**
 * Map database row and muscle mappings to domain Exercise entity
 */
function mapToDomain(row: ExerciseRow, muscleMappings: MuscleMapping[]): Exercise | null {
	// Safely parse movement pattern - use type guard
	let movementPattern = null;
	if (row.movementPattern !== null) {
		if (isValidMovementPattern(row.movementPattern)) {
			movementPattern = row.movementPattern;
		}
	}

	// Extract primary and secondary muscles from mappings
	const primaryMuscles: MuscleGroup[] = [];
	const secondaryMuscles: MuscleGroup[] = [];

	for (const mapping of muscleMappings) {
		if (isValidMuscleGroup(mapping.muscleGroupId)) {
			if (mapping.isPrimary) {
				primaryMuscles.push(mapping.muscleGroupId);
			} else {
				secondaryMuscles.push(mapping.muscleGroupId);
			}
		}
	}

	const result = createExercise({
		id: row.id,
		organizationId: row.organizationId,
		name: row.name,
		description: row.description,
		instructions: row.instructions,
		videoUrl: row.videoUrl,
		movementPattern,
		isUnilateral: row.isUnilateral,
		clonedFromId: row.clonedFromId,
		primaryMuscles,
		secondaryMuscles,
		archivedAt: row.archivedAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	});

	return result.isOk() ? result.value : null;
}

export function createExerciseRepository(db: DbClient): ExerciseRepositoryPort {
	return {
		findById(id: string): ResultAsync<Exercise, ExerciseRepositoryError> {
			return ResultAsync.fromPromise(
				(async () => {
					const row = await db
						.select()
						.from(exercises)
						.where(eq(exercises.id, id))
						.then((rows) => rows[0]);

					if (!row) {
						return null;
					}

					const muscleMappings = await fetchMuscleMappings(db, id);
					return { row, muscleMappings };
				})(),
				wrapDbError,
			).andThen((data) => {
				if (!data) {
					return err({ type: "NOT_FOUND", exerciseId: id } as const);
				}

				const exercise = mapToDomain(data.row, data.muscleMappings);
				if (!exercise) {
					return err({ type: "DATABASE_ERROR", message: "Invalid exercise data" } as const);
				}

				return ok(exercise);
			});
		},

		findAll(options?: ListExercisesOptions): ResultAsync<{ items: Exercise[]; totalCount: number }, ExerciseRepositoryError> {
			return ResultAsync.fromPromise(
				(async () => {
					const conditions = [];

					// Filter by organization:
					// - null = curated only (organizationId IS NULL)
					// - string = curated OR org's custom
					// - undefined = all exercises (no filter)
					if (options?.organizationId === null) {
						// Only curated exercises
						conditions.push(isNull(exercises.organizationId));
					} else if (options?.organizationId !== undefined) {
						// Curated OR org-specific
						conditions.push(
							or(isNull(exercises.organizationId), eq(exercises.organizationId, options.organizationId)),
						);
					}

					// Filter by movement pattern
					if (options?.movementPattern) {
						conditions.push(eq(exercises.movementPattern, options.movementPattern));
					}

					// Filter by search term (case-insensitive)
					if (options?.search) {
						conditions.push(ilike(exercises.name, `%${options.search}%`));
					}

					// Exclude archived by default
					if (!options?.includeArchived) {
						conditions.push(isNull(exercises.archivedAt));
					}

					// Build base query conditions
					const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

					// If filtering by muscle group, we need a subquery
					let exerciseIdsWithMuscle: string[] | null = null;
					if (options?.muscleGroup) {
						const muscleResults = await db
							.select({ exerciseId: exerciseMuscles.exerciseId })
							.from(exerciseMuscles)
							.where(eq(exerciseMuscles.muscleGroupId, options.muscleGroup));
						exerciseIdsWithMuscle = muscleResults.map((r) => r.exerciseId);

						// If no exercises match the muscle group, return empty
						if (exerciseIdsWithMuscle.length === 0) {
							return { items: [], totalCount: 0 };
						}
					}

					// Build final where clause with muscle group filter
					let finalWhereClause = whereClause;
					if (exerciseIdsWithMuscle !== null && exerciseIdsWithMuscle.length > 0) {
						// Use inArray equivalent - need to handle this with SQL
						const muscleCondition = sql`${exercises.id} IN (${sql.join(
							exerciseIdsWithMuscle.map((id) => sql`${id}`),
							sql`, `,
						)})`;

						finalWhereClause = whereClause ? and(whereClause, muscleCondition) : muscleCondition;
					}

					// Get count and rows in parallel
					const [countResult, rows] = await Promise.all([
						db.select({ count: count() }).from(exercises).where(finalWhereClause),
						db
							.select()
							.from(exercises)
							.where(finalWhereClause)
							.orderBy(exercises.name)
							.limit(options?.limit ?? 100)
							.offset(options?.offset ?? 0),
					]);

					// Fetch muscle mappings for all exercises
					const exerciseIds = rows.map((r) => r.id);
					let allMuscleMappings: Array<{ exerciseId: string; muscleGroupId: string; isPrimary: boolean }> = [];

					if (exerciseIds.length > 0) {
						allMuscleMappings = await db
							.select({
								exerciseId: exerciseMuscles.exerciseId,
								muscleGroupId: exerciseMuscles.muscleGroupId,
								isPrimary: exerciseMuscles.isPrimary,
							})
							.from(exerciseMuscles)
							.where(
								sql`${exerciseMuscles.exerciseId} IN (${sql.join(
									exerciseIds.map((id) => sql`${id}`),
									sql`, `,
								)})`,
							);
					}

					// Group muscle mappings by exercise ID
					const muscleMappingsByExercise = new Map<string, MuscleMapping[]>();
					for (const mapping of allMuscleMappings) {
						const existing = muscleMappingsByExercise.get(mapping.exerciseId) ?? [];
						existing.push({ muscleGroupId: mapping.muscleGroupId, isPrimary: mapping.isPrimary });
						muscleMappingsByExercise.set(mapping.exerciseId, existing);
					}

					// Map rows to domain entities
					const items = rows
						.map((row) => mapToDomain(row, muscleMappingsByExercise.get(row.id) ?? []))
						.filter((e): e is Exercise => e !== null);

					return {
						items,
						totalCount: countResult[0]?.count ?? 0,
					};
				})(),
				wrapDbError,
			);
		},

		create(exercise: Exercise): ResultAsync<Exercise, ExerciseRepositoryError> {
			return ResultAsync.fromPromise(
				db.transaction(async (tx) => {
					// Insert the exercise
					await tx.insert(exercises).values({
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
						archivedAt: exercise.archivedAt,
						createdAt: exercise.createdAt,
						updatedAt: exercise.updatedAt,
					});

					// Insert muscle mappings
					const muscleMappings: Array<{ exerciseId: string; muscleGroupId: string; isPrimary: boolean }> = [];

					for (const muscle of exercise.primaryMuscles) {
						muscleMappings.push({
							exerciseId: exercise.id,
							muscleGroupId: muscle,
							isPrimary: true,
						});
					}

					for (const muscle of exercise.secondaryMuscles) {
						muscleMappings.push({
							exerciseId: exercise.id,
							muscleGroupId: muscle,
							isPrimary: false,
						});
					}

					if (muscleMappings.length > 0) {
						await tx.insert(exerciseMuscles).values(muscleMappings);
					}

					return exercise;
				}),
				wrapDbError,
			);
		},

		update(exercise: Exercise): ResultAsync<Exercise, ExerciseRepositoryError> {
			return ResultAsync.fromPromise(
				db.transaction(async (tx) => {
					// Update the exercise
					const [updatedRow] = await tx
						.update(exercises)
						.set({
							name: exercise.name,
							description: exercise.description,
							instructions: exercise.instructions,
							videoUrl: exercise.videoUrl,
							movementPattern: exercise.movementPattern,
							isUnilateral: exercise.isUnilateral,
							updatedAt: new Date(),
						})
						.where(eq(exercises.id, exercise.id))
						.returning();

					if (!updatedRow) {
						throw new Error("Exercise not found");
					}

					// Delete existing muscle mappings
					await tx.delete(exerciseMuscles).where(eq(exerciseMuscles.exerciseId, exercise.id));

					// Insert new muscle mappings
					const muscleMappings: Array<{ exerciseId: string; muscleGroupId: string; isPrimary: boolean }> = [];

					for (const muscle of exercise.primaryMuscles) {
						muscleMappings.push({
							exerciseId: exercise.id,
							muscleGroupId: muscle,
							isPrimary: true,
						});
					}

					for (const muscle of exercise.secondaryMuscles) {
						muscleMappings.push({
							exerciseId: exercise.id,
							muscleGroupId: muscle,
							isPrimary: false,
						});
					}

					if (muscleMappings.length > 0) {
						await tx.insert(exerciseMuscles).values(muscleMappings);
					}

					return exercise;
				}),
				wrapDbError,
			).andThen(() => ok(exercise));
		},

		archive(id: string): ResultAsync<void, ExerciseRepositoryError> {
			return ResultAsync.fromPromise(
				db
					.update(exercises)
					.set({
						archivedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(exercises.id, id))
					.returning()
					.then((rows) => {
						if (rows.length === 0) {
							throw new Error("Exercise not found");
						}
						return undefined;
					}),
				(error) => {
					if (error instanceof Error && error.message === "Exercise not found") {
						return { type: "NOT_FOUND", exerciseId: id } as const;
					}
					return wrapDbError(error);
				},
			);
		},
	};
}
