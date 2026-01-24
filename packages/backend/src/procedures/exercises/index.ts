import { archiveExercise } from "./archive-exercise";
import { cloneExercise } from "./clone-exercise";
import { createExercise } from "./create-exercise";
import { getExercise } from "./get-exercise";
import { listExercises } from "./list-exercises";
import { listMuscleGroups } from "./list-muscle-groups";
import { updateExercise } from "./update-exercise";

/**
 * Exercises router
 * Handles exercise CRUD, cloning, and muscle group lookups
 *
 * Procedures:
 * - create: Create a custom exercise
 * - list: List exercises (curated + custom)
 * - get: Get exercise by ID
 * - update: Update a custom exercise
 * - archive: Archive a custom exercise (soft delete)
 * - clone: Clone an exercise to create a custom copy
 * - muscleGroups: List all muscle groups
 */
export const exercises = {
	create: createExercise,
	list: listExercises,
	get: getExercise,
	update: updateExercise,
	archive: archiveExercise,
	clone: cloneExercise,
	muscleGroups: listMuscleGroups,
};
