import { createLog } from './create-log'
import { deleteLog } from './delete-log'
import { getLog } from './get-log'
import { getLogBySession } from './get-log-by-session'
import { listAthleteLogs } from './list-athlete-logs'
import { listPendingWorkouts } from './list-pending-workouts'
import { saveLog } from './save-log'

/**
 * Workout Logs Router
 * Procedures for workout logging operations.
 *
 * Procedures:
 * - create: Create a new workout log from program prescription
 * - save: Save a workout log to the database
 * - get: Get a workout log by ID
 * - getBySession: Get a workout log by athlete/session/week combination
 * - listByAthlete: List workout logs for an athlete
 * - listPending: List pending workouts (sessions without logs)
 * - delete: Delete a workout log
 */
export const workoutLogs = {
  create: createLog,
  save: saveLog,
  get: getLog,
  getBySession: getLogBySession,
  listByAthlete: listAthleteLogs,
  listPending: listPendingWorkouts,
  delete: deleteLog,
}
