import { hasPermission, type OrganizationContext } from '@strenly/core'
import type { WorkoutLogRepository } from '@strenly/core/ports/workout-log-repository.port'
import { createWorkoutLog, type WorkoutLog } from '@strenly/core/domain/entities/workout-log/workout-log'
import type { LoggedExerciseInput, LogStatus } from '@strenly/core/domain/entities/workout-log/types'
import { errAsync, type ResultAsync } from 'neverthrow'

export type SaveLogInput = OrganizationContext & {
  id: string
  athleteId: string
  programId: string
  sessionId: string
  weekId: string
  logDate: Date
  sessionRpe?: number | null
  sessionNotes?: string | null
  exercises: LoggedExerciseInput[]
}

export type SaveLogError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  workoutLogRepository: WorkoutLogRepository
}

/**
 * Calculate log status automatically from exercise states.
 * - 'completed' if all exercises done (not skipped) with all series done
 * - 'skipped' if all exercises skipped
 * - 'partial' otherwise
 */
function calculateStatus(exercises: ReadonlyArray<LoggedExerciseInput>): LogStatus {
  if (exercises.length === 0) {
    return 'partial'
  }

  const allSkipped = exercises.every((ex) => ex.skipped === true)
  if (allSkipped) {
    return 'skipped'
  }

  const allCompleted = exercises.every((ex) => {
    // Exercise is completed if not skipped and all series are not skipped
    if (ex.skipped) {
      return false
    }
    const series = ex.series ?? []
    if (series.length === 0) {
      return false // No series means not completed
    }
    return series.every((s) => s.skipped !== true)
  })

  if (allCompleted) {
    return 'completed'
  }

  return 'partial'
}

/**
 * Save a workout log to the database.
 *
 * This use case:
 * 1. Checks authorization
 * 2. Validates via domain factory (createWorkoutLog)
 * 3. Calculates status automatically from exercise states
 * 4. Persists via repository.save()
 * 5. Returns saved log
 */
export const makeSaveLog =
  (deps: Dependencies) =>
  (input: SaveLogInput): ResultAsync<WorkoutLog, SaveLogError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to save workout logs',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Calculate status automatically
    const status = calculateStatus(input.exercises)

    // 3. Validate via domain factory
    const logResult = createWorkoutLog({
      id: input.id,
      organizationId: input.organizationId,
      athleteId: input.athleteId,
      programId: input.programId,
      sessionId: input.sessionId,
      weekId: input.weekId,
      logDate: input.logDate,
      status,
      sessionRpe: input.sessionRpe ?? null,
      sessionNotes: input.sessionNotes ?? null,
      exercises: input.exercises,
    })

    if (logResult.isErr()) {
      return errAsync({
        type: 'validation_error',
        message: logResult.error.message,
      })
    }

    const log = logResult.value

    // 4. Persist via repository
    return deps.workoutLogRepository
      .save(ctx, log)
      .mapErr(
        (e): SaveLogError => ({
          type: 'repository_error',
          message: e.message,
        }),
      )
      .map(() => log)
  }
