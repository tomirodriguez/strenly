/**
 * Exercise contracts - API schemas for exercise CRUD operations
 */
export {
	archiveExerciseInputSchema,
	archiveExerciseOutputSchema,
	cloneExerciseInputSchema,
	createExerciseInputSchema,
	exerciseSchema,
	getExerciseInputSchema,
	listExercisesInputSchema,
	listExercisesOutputSchema,
	updateExerciseInputSchema,
	type ArchiveExerciseInput,
	type ArchiveExerciseOutput,
	type CloneExerciseInput,
	type CreateExerciseInput,
	type Exercise,
	type GetExerciseInput,
	type ListExercisesInput,
	type ListExercisesOutput,
	type UpdateExerciseInput,
} from "./exercise";

export {
	bodyRegionSchema,
	movementPatternSchema,
	muscleGroupInfoSchema,
	muscleGroupSchema,
	type BodyRegion,
	type MovementPattern,
	type MuscleGroup,
	type MuscleGroupInfo,
} from "./muscle-group";
