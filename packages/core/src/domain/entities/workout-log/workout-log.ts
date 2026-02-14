/**
 * WorkoutLog Aggregate Root
 *
 * The WorkoutLog is the aggregate root for tracking athlete workout execution:
 * WorkoutLog -> LoggedExercises -> LoggedSeries
 *
 * It captures what athletes actually performed versus what was prescribed.
 * The log stores both actual performance (repsPerformed, weightUsed, rpe)
 * and prescribed snapshots for deviation display.
 *
 * All validation happens through createWorkoutLog(), which validates the entire
 * hierarchy before returning ok(). The reconstituteWorkoutLog() function is used
 * for database loads where data is already known to be valid.
 */

import { err, ok, type Result } from 'neverthrow'
import { validateLoggedExercise } from './logged-exercise'
import type { CreateWorkoutLogInput, LoggedExercise, WorkoutLog, WorkoutLogError } from './types'

export type { WorkoutLog, WorkoutLogError } from './types'

/**
 * Create a new WorkoutLog with full hierarchy validation.
 *
 * @param input - The workout log input data including nested exercises/series
 * @returns Result<WorkoutLog, WorkoutLogError> - ok(WorkoutLog) if valid, err(WorkoutLogError) with context otherwise
 */
export function createWorkoutLog(input: CreateWorkoutLogInput): Result<WorkoutLog, WorkoutLogError> {
  // Validate athleteId required
  if (!input.athleteId || input.athleteId.trim() === '') {
    return err({
      type: 'ATHLETE_ID_REQUIRED',
      message: 'Athlete ID is required',
    })
  }

  // Validate programId required
  if (!input.programId || input.programId.trim() === '') {
    return err({
      type: 'PROGRAM_ID_REQUIRED',
      message: 'Program ID is required',
    })
  }

  // Validate sessionId required
  if (!input.sessionId || input.sessionId.trim() === '') {
    return err({
      type: 'SESSION_ID_REQUIRED',
      message: 'Session ID is required',
    })
  }

  // Validate weekId required
  if (!input.weekId || input.weekId.trim() === '') {
    return err({
      type: 'WEEK_ID_REQUIRED',
      message: 'Week ID is required',
    })
  }

  // Validate logDate is a valid date
  if (!input.logDate || Number.isNaN(input.logDate.getTime())) {
    return err({
      type: 'LOG_DATE_REQUIRED',
      message: 'Log date is required and must be valid',
    })
  }

  // Validate sessionRpe if provided (must be 1-10)
  if (input.sessionRpe !== undefined && input.sessionRpe !== null) {
    if (input.sessionRpe < 1 || input.sessionRpe > 10) {
      return err({
        type: 'INVALID_SESSION_RPE',
        message: `Session RPE must be between 1 and 10, got ${input.sessionRpe}`,
      })
    }
  }

  // Validate exercises
  const exerciseInputs = input.exercises ?? []
  const validatedExercises: LoggedExercise[] = []

  for (const [exerciseIndex, exerciseInput] of exerciseInputs.entries()) {
    const exerciseResult = validateLoggedExercise(exerciseInput, exerciseIndex)
    if (exerciseResult.isErr()) {
      return err(exerciseResult.error)
    }
    validatedExercises.push(exerciseResult.value)
  }

  const now = new Date()

  return ok({
    id: input.id,
    organizationId: input.organizationId,
    athleteId: input.athleteId.trim(),
    programId: input.programId.trim(),
    sessionId: input.sessionId.trim(),
    weekId: input.weekId.trim(),
    logDate: input.logDate,
    status: input.status ?? 'partial',
    sessionRpe: input.sessionRpe ?? null,
    sessionNotes: input.sessionNotes ?? null,
    exercises: validatedExercises,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    // Display context
    programName: input.programName ?? null,
    weekName: input.weekName ?? null,
    sessionName: input.sessionName ?? null,
    athleteName: input.athleteName ?? null,
  })
}

/**
 * Reconstitute a WorkoutLog from database props without validation.
 * Used when loading from the database where data is already known to be valid.
 *
 * @param props - The complete workout log properties from the database
 * @returns WorkoutLog - The reconstituted workout log
 */
export function reconstituteWorkoutLog(props: WorkoutLog): WorkoutLog {
  return { ...props }
}
