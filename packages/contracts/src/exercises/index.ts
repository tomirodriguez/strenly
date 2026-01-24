/**
 * Exercise contracts - API schemas for exercise CRUD operations
 */
export {
  type ArchiveExerciseInput,
  type ArchiveExerciseOutput,
  archiveExerciseInputSchema,
  archiveExerciseOutputSchema,
  type CloneExerciseInput,
  type CreateExerciseInput,
  cloneExerciseInputSchema,
  createExerciseInputSchema,
  type Exercise,
  exerciseSchema,
  type GetExerciseInput,
  getExerciseInputSchema,
  type ListExercisesInput,
  type ListExercisesOutput,
  listExercisesInputSchema,
  listExercisesOutputSchema,
  type UpdateExerciseInput,
  updateExerciseInputSchema,
} from './exercise'
export {
  type BodyRegion,
  bodyRegionSchema,
  type MovementPattern,
  type MuscleGroup,
  type MuscleGroupInfo,
  movementPatternSchema,
  muscleGroupInfoSchema,
  muscleGroupSchema,
} from './muscle-group'
