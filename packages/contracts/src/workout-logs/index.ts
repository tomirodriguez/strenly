/**
 * Workout Logs contracts - API schemas for workout log operations
 */

// Workout log entity schemas
export {
  type LoggedExercise,
  type LoggedExerciseInput,
  loggedExerciseInputSchema,
  loggedExerciseSchema,
  type LoggedSeries,
  type LoggedSeriesInput,
  loggedSeriesInputSchema,
  loggedSeriesSchema,
  type LogStatus,
  logStatusSchema,
  type WorkoutLog,
  type WorkoutLogAggregate,
  workoutLogAggregateSchema,
  workoutLogSchema,
} from './workout-log'

// Create log operation
export {
  type CreateLogInput,
  createLogInputSchema,
  type CreateLogOutput,
  createLogOutputSchema,
} from './create-log'

// Save log operation
export {
  type SaveLogInput,
  saveLogInputSchema,
  type SaveLogOutput,
  saveLogOutputSchema,
} from './save-log'

// List and get operations
export {
  type DeleteLogInput,
  deleteLogInputSchema,
  type GetLogInput,
  getLogInputSchema,
  type GetLogOutput,
  getLogOutputSchema,
  type ListAthleteLogsInput,
  listAthleteLogsInputSchema,
  type ListAthleteLogsOutput,
  listAthleteLogsOutputSchema,
  type ListPendingWorkoutsInput,
  listPendingWorkoutsInputSchema,
  type ListPendingWorkoutsOutput,
  listPendingWorkoutsOutputSchema,
  type PendingWorkout,
  pendingWorkoutSchema,
} from './list-logs'
