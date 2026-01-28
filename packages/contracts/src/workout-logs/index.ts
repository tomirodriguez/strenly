/**
 * Workout Logs contracts - API schemas for workout log operations
 */

// Create log operation
export {
  type CreateLogInput,
  type CreateLogOutput,
  createLogInputSchema,
  createLogOutputSchema,
} from './create-log'
// List and get operations
export {
  type DeleteLogInput,
  deleteLogInputSchema,
  type GetLogInput,
  type GetLogOutput,
  getLogInputSchema,
  getLogOutputSchema,
  type ListAthleteLogsInput,
  type ListAthleteLogsOutput,
  type ListPendingWorkoutsInput,
  type ListPendingWorkoutsOutput,
  listAthleteLogsInputSchema,
  listAthleteLogsOutputSchema,
  listPendingWorkoutsInputSchema,
  listPendingWorkoutsOutputSchema,
  type PendingWorkout,
  pendingWorkoutSchema,
} from './list-logs'
// Save log operation
export {
  type SaveLogInput,
  type SaveLogOutput,
  saveLogInputSchema,
  saveLogOutputSchema,
} from './save-log'
// Workout log entity schemas
export {
  type LoggedExercise,
  type LoggedExerciseInput,
  type LoggedSeries,
  type LoggedSeriesInput,
  type LogStatus,
  loggedExerciseInputSchema,
  loggedExerciseSchema,
  loggedSeriesInputSchema,
  loggedSeriesSchema,
  logStatusSchema,
  type WorkoutLog,
  type WorkoutLogAggregate,
  workoutLogAggregateSchema,
  workoutLogSchema,
} from './workout-log'
