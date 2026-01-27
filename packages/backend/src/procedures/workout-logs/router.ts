/**
 * Workout Logs Router
 *
 * oRPC procedures for workout log operations.
 * Exposes all workout log use cases via HTTP API.
 */

import {
  createLogInputSchema,
  createLogOutputSchema,
  deleteLogInputSchema,
  getLogInputSchema,
  getLogOutputSchema,
  listAthleteLogsInputSchema,
  listAthleteLogsOutputSchema,
  listPendingWorkoutsInputSchema,
  listPendingWorkoutsOutputSchema,
  saveLogInputSchema,
  saveLogOutputSchema,
} from '@strenly/contracts/workout-logs'
import { z } from 'zod'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { createWorkoutLogRepository } from '../../infrastructure/repositories/workout-log.repository'
import { authProcedure } from '../../lib/orpc'
import { makeCreateLog } from '../../use-cases/workout-logs/create-log'
import { makeDeleteLog } from '../../use-cases/workout-logs/delete-log'
import { makeGetLog } from '../../use-cases/workout-logs/get-log'
import { makeListAthleteLogs } from '../../use-cases/workout-logs/list-athlete-logs'
import { makeListPendingWorkouts } from '../../use-cases/workout-logs/list-pending-workouts'
import { makeSaveLog } from '../../use-cases/workout-logs/save-log'

// ============================================================================
// Helper: Map WorkoutLog domain entity to output schema
// ============================================================================

function mapLogToOutput(log: {
  id: string
  organizationId: string
  athleteId: string
  programId: string
  sessionId: string
  weekId: string
  logDate: Date
  status: 'completed' | 'partial' | 'skipped'
  sessionRpe: number | null
  sessionNotes: string | null
  exercises: ReadonlyArray<{
    id: string
    exerciseId: string
    groupItemId: string
    orderIndex: number
    notes: string | null
    skipped: boolean
    series: ReadonlyArray<{
      orderIndex: number
      repsPerformed: number | null
      weightUsed: number | null
      rpe: number | null
      skipped: boolean
      prescribedReps: number | null
      prescribedWeight: number | null
    }>
  }>
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: log.id,
    organizationId: log.organizationId,
    athleteId: log.athleteId,
    programId: log.programId,
    sessionId: log.sessionId,
    weekId: log.weekId,
    logDate: log.logDate.toISOString(),
    status: log.status,
    sessionRpe: log.sessionRpe,
    sessionNotes: log.sessionNotes,
    exercises: log.exercises.map((ex) => ({
      id: ex.id,
      exerciseId: ex.exerciseId,
      groupItemId: ex.groupItemId,
      orderIndex: ex.orderIndex,
      notes: ex.notes,
      skipped: ex.skipped,
      series: ex.series.map((s) => ({
        orderIndex: s.orderIndex,
        repsPerformed: s.repsPerformed,
        weightUsed: s.weightUsed,
        rpe: s.rpe,
        skipped: s.skipped,
        prescribedReps: s.prescribedReps,
        prescribedWeight: s.prescribedWeight,
      })),
    })),
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  }
}

// ============================================================================
// Procedures
// ============================================================================

/**
 * Create a new workout log from program prescription.
 * Returns pre-filled log for client-side editing (NOT persisted).
 */
const create = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to log workouts' },
    LOG_ALREADY_EXISTS: { message: 'Workout log already exists for this session and week' },
    PROGRAM_NOT_FOUND: { message: 'Program not found' },
    SESSION_NOT_FOUND: { message: 'Session not found' },
    WEEK_NOT_FOUND: { message: 'Week not found' },
    VALIDATION_ERROR: { message: 'Invalid log data' },
  })
  .input(createLogInputSchema)
  .output(createLogOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeCreateLog({
      workoutLogRepository: createWorkoutLogRepository(context.db),
      programRepository: createProgramRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const logDate = input.logDate ? new Date(input.logDate) : new Date()

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      athleteId: input.athleteId,
      programId: input.programId,
      sessionId: input.sessionId,
      weekId: input.weekId,
      logDate,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'log_already_exists':
          throw errors.LOG_ALREADY_EXISTS({
            message: `Workout log already exists for athlete ${result.error.athleteId}, session ${result.error.sessionId}, week ${result.error.weekId}`,
          })
        case 'program_not_found':
          throw errors.PROGRAM_NOT_FOUND({ message: `Program ${result.error.programId} not found` })
        case 'session_not_found':
          throw errors.SESSION_NOT_FOUND({ message: `Session ${result.error.sessionId} not found` })
        case 'week_not_found':
          throw errors.WEEK_NOT_FOUND({ message: `Week ${result.error.weekId} not found` })
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error in createLog:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return mapLogToOutput(result.value)
  })

/**
 * Save a workout log to the database.
 * Calculates status automatically from exercise states.
 */
const save = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to save workout logs' },
    VALIDATION_ERROR: { message: 'Invalid log data' },
  })
  .input(saveLogInputSchema)
  .output(saveLogOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeSaveLog({
      workoutLogRepository: createWorkoutLogRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      id: input.id,
      athleteId: input.athleteId,
      programId: input.programId,
      sessionId: input.sessionId,
      weekId: input.weekId,
      logDate: new Date(input.logDate),
      sessionRpe: input.sessionRpe,
      sessionNotes: input.sessionNotes,
      exercises: input.exercises.map((ex) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        groupItemId: ex.groupItemId,
        orderIndex: ex.orderIndex,
        notes: ex.notes ?? null,
        skipped: ex.skipped ?? false,
        series: ex.series?.map((s) => ({
          repsPerformed: s.repsPerformed ?? null,
          weightUsed: s.weightUsed ?? null,
          rpe: s.rpe ?? null,
          skipped: s.skipped ?? false,
          prescribedReps: s.prescribedReps ?? null,
          prescribedWeight: s.prescribedWeight ?? null,
        })),
      })),
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error in saveLog:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return mapLogToOutput(result.value)
  })

/**
 * Get a workout log by ID.
 */
const get = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to view workout logs' },
    NOT_FOUND: { message: 'Workout log not found' },
  })
  .input(getLogInputSchema)
  .output(getLogOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeGetLog({
      workoutLogRepository: createWorkoutLogRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      logId: input.logId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'not_found':
          throw errors.NOT_FOUND({ message: `Workout log ${result.error.logId} not found` })
        case 'repository_error':
          console.error('Repository error in getLog:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return mapLogToOutput(result.value)
  })

/**
 * List workout logs for an athlete with filters and pagination.
 */
const listByAthlete = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to view workout logs' },
  })
  .input(listAthleteLogsInputSchema)
  .output(listAthleteLogsOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeListAthleteLogs({
      workoutLogRepository: createWorkoutLogRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      athleteId: input.athleteId,
      status: input.status,
      fromDate: input.fromDate ? new Date(input.fromDate) : undefined,
      toDate: input.toDate ? new Date(input.toDate) : undefined,
      limit: input.limit,
      offset: input.offset,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error in listAthleteLogs:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return {
      items: result.value.items.map(mapLogToOutput),
      totalCount: result.value.totalCount,
    }
  })

/**
 * List pending workouts (sessions without logs).
 * Used for the logging dashboard.
 */
const listPending = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to view workout logs' },
  })
  .input(listPendingWorkoutsInputSchema)
  .output(listPendingWorkoutsOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeListPendingWorkouts({
      workoutLogRepository: createWorkoutLogRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      limit: input.limit,
      offset: input.offset,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error in listPendingWorkouts:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return result.value
  })

/**
 * Delete a workout log by ID.
 */
const deleteLog = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to delete workout logs' },
    NOT_FOUND: { message: 'Workout log not found' },
  })
  .input(deleteLogInputSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    const useCase = makeDeleteLog({
      workoutLogRepository: createWorkoutLogRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      logId: input.logId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'not_found':
          throw errors.NOT_FOUND({ message: `Workout log ${result.error.logId} not found` })
        case 'repository_error':
          console.error('Repository error in deleteLog:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return { success: true }
  })

// ============================================================================
// Router
// ============================================================================

/**
 * Workout Logs Router
 * Procedures for workout logging operations.
 */
export const workoutLogs = {
  create,
  save,
  get,
  listByAthlete,
  listPending,
  delete: deleteLog,
}
