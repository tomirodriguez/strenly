import { hasPermission, type OrganizationContext, type ProgramRepositoryPort } from '@strenly/core'
import type { Program, Series, Session } from '@strenly/core/domain/entities/program/types'
import type { LoggedExerciseInput, LoggedSeriesInput } from '@strenly/core/domain/entities/workout-log/types'
import { createWorkoutLog, type WorkoutLog } from '@strenly/core/domain/entities/workout-log/workout-log'
import type { WorkoutLogRepository } from '@strenly/core/ports/workout-log-repository.port'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type CreateLogInput = OrganizationContext & {
  athleteId: string
  programId: string
  sessionId: string
  weekId: string
  logDate: Date
}

export type CreateLogError =
  | { type: 'forbidden'; message: string }
  | { type: 'log_already_exists'; athleteId: string; sessionId: string; weekId: string }
  | { type: 'program_not_found'; programId: string }
  | { type: 'session_not_found'; sessionId: string }
  | { type: 'week_not_found'; weekId: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  workoutLogRepository: WorkoutLogRepository
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

/**
 * Pre-fill series from prescription values.
 * Pre-fills repsPerformed and weightUsed from prescription.
 * Never pre-fills RPE (athlete-specific).
 * Snapshots prescribed values for deviation display.
 */
function buildLoggedSeries(prescribedSeries: ReadonlyArray<Series>): LoggedSeriesInput[] {
  return prescribedSeries.map((series) => {
    // Calculate prescribed weight based on intensity type
    let prescribedWeight: number | null = null
    if (series.intensityType === 'absolute' && series.intensityValue !== null) {
      prescribedWeight = series.intensityValue
    }
    // For percentage/RPE/RIR, we don't have a concrete weight - need 1RM data
    // For now, leave as null - future enhancement

    // Pre-fill reps from prescription (use reps, not repsMax)
    const prescribedReps = series.reps

    return {
      repsPerformed: prescribedReps, // Pre-fill with prescribed
      weightUsed: prescribedWeight, // Pre-fill if absolute
      rpe: null, // Never pre-fill RPE
      skipped: false,
      prescribedReps,
      prescribedWeight,
    }
  })
}

/**
 * Build logged exercises from session prescription data.
 * Creates LoggedExercise array with series pre-filled from prescription.
 */
function buildLoggedExercises(session: Session, generateId: () => string): LoggedExerciseInput[] {
  const exercises: LoggedExerciseInput[] = []
  let orderIndex = 0

  for (const group of session.exerciseGroups) {
    for (const item of group.items) {
      exercises.push({
        id: generateId(),
        exerciseId: item.exerciseId,
        groupItemId: item.id,
        orderIndex: orderIndex++,
        notes: null,
        skipped: false,
        series: buildLoggedSeries(item.series),
      })
    }
  }

  return exercises
}

/**
 * Build workout log from program prescription.
 */
function buildWorkoutLogFromProgram(
  input: CreateLogInput,
  program: Program,
  generateId: () => string,
): ResultAsync<WorkoutLog, CreateLogError> {
  // Find the week
  const week = program.weeks.find((w) => w.id === input.weekId)
  if (!week) {
    return errAsync({
      type: 'week_not_found',
      weekId: input.weekId,
    })
  }

  // Find the session within the week
  const session = week.sessions.find((s) => s.id === input.sessionId)
  if (!session) {
    return errAsync({
      type: 'session_not_found',
      sessionId: input.sessionId,
    })
  }

  // Build logged exercises with pre-filled values from prescription
  const exercises = buildLoggedExercises(session, generateId)

  // Create domain entity via factory (validates)
  const logResult = createWorkoutLog({
    id: generateId(),
    organizationId: input.organizationId,
    athleteId: input.athleteId,
    programId: input.programId,
    sessionId: input.sessionId,
    weekId: input.weekId,
    logDate: input.logDate,
    status: 'partial', // Always starts as partial
    sessionRpe: null,
    sessionNotes: null,
    exercises,
  })

  if (logResult.isErr()) {
    return errAsync({
      type: 'validation_error',
      message: logResult.error.message,
    })
  }

  return okAsync(logResult.value)
}

/**
 * Create a new workout log from program prescription.
 *
 * This use case:
 * 1. Checks authorization
 * 2. Checks if log already exists for athlete/session/week (returns error if so)
 * 3. Loads program aggregate to get prescription data
 * 4. Extracts session and pre-fills exercises from prescription
 * 5. Creates domain entity via createWorkoutLog (validates)
 * 6. Returns pre-filled log for client-side editing (does NOT persist)
 *
 * The client will call saveLog after editing to persist.
 */
export const makeCreateLog =
  (deps: Dependencies) =>
  (input: CreateLogInput): ResultAsync<WorkoutLog, CreateLogError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to log workouts',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Check if log already exists for this athlete/session/week
    return deps.workoutLogRepository
      .findByAthleteSessionWeek(ctx, input.athleteId, input.sessionId, input.weekId)
      .mapErr(
        (e): CreateLogError => ({
          type: 'repository_error',
          message: e.message,
        }),
      )
      .andThen((existingLog): ResultAsync<Program, CreateLogError> => {
        if (existingLog !== null) {
          return errAsync({
            type: 'log_already_exists',
            athleteId: input.athleteId,
            sessionId: input.sessionId,
            weekId: input.weekId,
          })
        }

        // 3. Load program aggregate to get prescription data
        return deps.programRepository.loadProgramAggregate(ctx, input.programId).mapErr((e): CreateLogError => {
          if (e.type === 'NOT_FOUND') {
            return { type: 'program_not_found', programId: input.programId }
          }
          return { type: 'repository_error', message: e.message }
        })
      })
      .andThen((program) => buildWorkoutLogFromProgram(input, program, deps.generateId))
  }
