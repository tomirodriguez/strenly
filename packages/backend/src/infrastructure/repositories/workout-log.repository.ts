/**
 * WorkoutLogRepository Implementation
 *
 * Provides data access layer for workout logs following the aggregate pattern.
 * Uses DELETE + INSERT for save operations (same as program repository approach).
 *
 * All methods filter by organizationId for multi-tenancy.
 */

import type { OrganizationContext } from '@strenly/core'
import type { LoggedExercise, LoggedSeries, WorkoutLog } from '@strenly/core/domain/entities/workout-log/types'
import { isLogStatus } from '@strenly/core/domain/entities/workout-log/types'
import { reconstituteWorkoutLog } from '@strenly/core/domain/entities/workout-log/workout-log'
import type {
  PendingWorkout,
  WorkoutLogFilters,
  WorkoutLogRepository,
  WorkoutLogRepositoryError,
} from '@strenly/core/ports/workout-log-repository.port'
import type { DbClient } from '@strenly/database'
import {
  athletes,
  type LoggedSeriesData,
  loggedExercises,
  programSessions,
  programs,
  programWeeks,
  workoutLogs,
} from '@strenly/database/schema'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { err, ok, ResultAsync as RA, type ResultAsync } from 'neverthrow'

// ============================================================================
// Error Helpers
// ============================================================================

function wrapDbError(error: unknown): WorkoutLogRepositoryError {
  console.error('WorkoutLog repository error:', error)

  // Check for constraint violations (unique constraint on athlete_session_week)
  if (error instanceof Error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return {
        type: 'CONFLICT',
        message: 'A workout log already exists for this athlete, session, and week',
      }
    }
  }

  return { type: 'DATABASE_ERROR', message: 'Database operation failed' }
}

function notFoundError(message: string): WorkoutLogRepositoryError {
  return { type: 'NOT_FOUND', message }
}

// ============================================================================
// Type Inference
// ============================================================================

type WorkoutLogRow = typeof workoutLogs.$inferSelect
type LoggedExerciseRow = typeof loggedExercises.$inferSelect

// ============================================================================
// Domain Mappers
// ============================================================================

/**
 * Map database series JSONB to domain LoggedSeries
 */
function mapDbSeriesToDomain(dbSeries: LoggedSeriesData[]): LoggedSeries[] {
  return dbSeries.map((s, index) => ({
    orderIndex: s.orderIndex ?? index,
    repsPerformed: s.repsPerformed,
    weightUsed: s.weightUsed,
    rpe: s.rpe,
    skipped: s.skipped,
    prescribedReps: s.prescribedReps,
    prescribedWeight: s.prescribedWeight,
  }))
}

/**
 * Map domain LoggedSeries to database JSONB format
 */
function mapSeriesToDb(series: ReadonlyArray<LoggedSeries>): LoggedSeriesData[] {
  return series.map((s, index) => ({
    orderIndex: s.orderIndex ?? index,
    repsPerformed: s.repsPerformed,
    weightUsed: s.weightUsed,
    rpe: s.rpe,
    skipped: s.skipped,
    prescribedReps: s.prescribedReps,
    prescribedWeight: s.prescribedWeight,
  }))
}

/**
 * Map database rows to domain LoggedExercise
 */
function mapExerciseRowToDomain(row: LoggedExerciseRow): LoggedExercise {
  return {
    id: row.id,
    exerciseId: row.exerciseId,
    groupItemId: row.groupItemId,
    orderIndex: row.orderIndex,
    notes: row.notes,
    skipped: row.skipped,
    series: mapDbSeriesToDomain(row.series),
  }
}

/**
 * Map database workout log row with exercises to domain WorkoutLog
 */
function mapToDomain(logRow: WorkoutLogRow, exerciseRows: LoggedExerciseRow[]): WorkoutLog {
  const status = isLogStatus(logRow.status) ? logRow.status : 'partial'

  return reconstituteWorkoutLog({
    id: logRow.id,
    organizationId: logRow.organizationId,
    athleteId: logRow.athleteId,
    programId: logRow.programId,
    sessionId: logRow.sessionId,
    weekId: logRow.weekId,
    logDate: logRow.logDate,
    status,
    sessionRpe: logRow.sessionRpe,
    sessionNotes: logRow.sessionNotes,
    exercises: exerciseRows.map(mapExerciseRowToDomain),
    createdAt: logRow.createdAt,
    updatedAt: logRow.updatedAt,
  })
}

/**
 * Ensure log ID has 'log-' prefix
 */
function ensureLogPrefix(id: string): string {
  return id.startsWith('log-') ? id : `log-${id}`
}

/**
 * Ensure logged exercise ID has 'lex-' prefix
 */
function ensureLexPrefix(id: string): string {
  return id.startsWith('lex-') ? id : `lex-${id}`
}

// ============================================================================
// Repository Factory
// ============================================================================

export function createWorkoutLogRepository(db: DbClient): WorkoutLogRepository {
  /**
   * Helper to verify a workout log exists and belongs to the organization
   */
  async function verifyLogAccess(ctx: OrganizationContext, logId: string): Promise<WorkoutLogRow | null> {
    const rows = await db
      .select()
      .from(workoutLogs)
      .where(and(eq(workoutLogs.id, logId), eq(workoutLogs.organizationId, ctx.organizationId)))

    return rows[0] ?? null
  }

  /**
   * Helper to load exercises for a workout log
   */
  async function loadExercisesForLog(logId: string): Promise<LoggedExerciseRow[]> {
    return db.select().from(loggedExercises).where(eq(loggedExercises.logId, logId)).orderBy(loggedExercises.orderIndex)
  }

  return {
    // -------------------------------------------------------------------------
    // save - Atomic DELETE + INSERT for aggregate persistence
    // -------------------------------------------------------------------------

    save(ctx: OrganizationContext, log: WorkoutLog): ResultAsync<void, WorkoutLogRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: WorkoutLogRepositoryError }> => {
          const logId = ensureLogPrefix(log.id)
          const now = new Date()

          await db.transaction(async (tx) => {
            // 1. DELETE existing logged_exercises for this log (if exists)
            await tx.delete(loggedExercises).where(eq(loggedExercises.logId, logId))

            // 2. DELETE existing workout_log record (if exists)
            await tx.delete(workoutLogs).where(eq(workoutLogs.id, logId))

            // 3. INSERT new workout_log record
            await tx.insert(workoutLogs).values({
              id: logId,
              organizationId: ctx.organizationId,
              athleteId: log.athleteId,
              programId: log.programId,
              sessionId: log.sessionId,
              weekId: log.weekId,
              logDate: log.logDate,
              status: log.status,
              sessionRpe: log.sessionRpe,
              sessionNotes: log.sessionNotes,
              createdAt: log.createdAt ?? now,
              updatedAt: now,
            })

            // 4. INSERT all logged_exercises with series as JSONB
            for (const exercise of log.exercises) {
              await tx.insert(loggedExercises).values({
                id: ensureLexPrefix(exercise.id),
                logId,
                exerciseId: exercise.exerciseId,
                groupItemId: exercise.groupItemId,
                orderIndex: exercise.orderIndex,
                notes: exercise.notes,
                skipped: exercise.skipped,
                series: mapSeriesToDb(exercise.series),
                createdAt: now,
                updatedAt: now,
              })
            }
          })

          return { ok: true }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(undefined)
      })
    },

    // -------------------------------------------------------------------------
    // findById - Load workout log with all exercises
    // -------------------------------------------------------------------------

    findById(ctx: OrganizationContext, logId: string): ResultAsync<WorkoutLog | null, WorkoutLogRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: WorkoutLog | null } | { ok: false; error: WorkoutLogRepositoryError }> => {
          const prefixedId = ensureLogPrefix(logId)

          // Query workout_logs with organizationId filter
          const logRow = await verifyLogAccess(ctx, prefixedId)
          if (!logRow) {
            return { ok: true, data: null }
          }

          // Load exercises for this log
          const exerciseRows = await loadExercisesForLog(prefixedId)

          return { ok: true, data: mapToDomain(logRow, exerciseRows) }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },

    // -------------------------------------------------------------------------
    // findByAthleteSessionWeek - Check existence before creating new log
    // -------------------------------------------------------------------------

    findByAthleteSessionWeek(
      ctx: OrganizationContext,
      athleteId: string,
      sessionId: string,
      weekId: string,
    ): ResultAsync<WorkoutLog | null, WorkoutLogRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: WorkoutLog | null } | { ok: false; error: WorkoutLogRepositoryError }> => {
          // Query with all three conditions + organizationId
          const logRows = await db
            .select()
            .from(workoutLogs)
            .where(
              and(
                eq(workoutLogs.organizationId, ctx.organizationId),
                eq(workoutLogs.athleteId, athleteId),
                eq(workoutLogs.sessionId, sessionId),
                eq(workoutLogs.weekId, weekId),
              ),
            )

          const logRow = logRows[0]
          if (!logRow) {
            return { ok: true, data: null }
          }

          // Load exercises for this log
          const exerciseRows = await loadExercisesForLog(logRow.id)

          return { ok: true, data: mapToDomain(logRow, exerciseRows) }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },

    // -------------------------------------------------------------------------
    // listByAthlete - Paginated list with filters
    // -------------------------------------------------------------------------

    listByAthlete(
      ctx: OrganizationContext,
      athleteId: string,
      filters?: Omit<WorkoutLogFilters, 'athleteId'>,
    ): ResultAsync<{ items: WorkoutLog[]; totalCount: number }, WorkoutLogRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<
          | { ok: true; data: { items: WorkoutLog[]; totalCount: number } }
          | { ok: false; error: WorkoutLogRepositoryError }
        > => {
          // Build conditions
          const conditions = [eq(workoutLogs.organizationId, ctx.organizationId), eq(workoutLogs.athleteId, athleteId)]

          // Optional status filter
          if (filters?.status) {
            conditions.push(eq(workoutLogs.status, filters.status))
          }

          // Optional date range filters
          if (filters?.fromDate) {
            conditions.push(gte(workoutLogs.logDate, filters.fromDate))
          }
          if (filters?.toDate) {
            conditions.push(lte(workoutLogs.logDate, filters.toDate))
          }

          // Optional program filter
          if (filters?.programId) {
            conditions.push(eq(workoutLogs.programId, filters.programId))
          }

          const whereClause = and(...conditions)

          // Get total count and paginated logs in parallel
          const [countResult, logRows] = await Promise.all([
            db.select({ count: count() }).from(workoutLogs).where(whereClause),
            db
              .select()
              .from(workoutLogs)
              .where(whereClause)
              .orderBy(desc(workoutLogs.logDate))
              .limit(filters?.limit ?? 50)
              .offset(filters?.offset ?? 0),
          ])

          const totalCount = countResult[0]?.count ?? 0

          // Batch load exercises for all logs to avoid N+1
          if (logRows.length === 0) {
            return { ok: true, data: { items: [], totalCount } }
          }

          const logIds = logRows.map((l) => l.id)
          const allExercises = await db
            .select()
            .from(loggedExercises)
            .where(
              sql`${loggedExercises.logId} IN (${sql.join(
                logIds.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            )
            .orderBy(loggedExercises.orderIndex)

          // Group exercises by log ID
          const exercisesByLogId = new Map<string, LoggedExerciseRow[]>()
          for (const exercise of allExercises) {
            const existing = exercisesByLogId.get(exercise.logId) ?? []
            existing.push(exercise)
            exercisesByLogId.set(exercise.logId, existing)
          }

          // Map to domain
          const items = logRows.map((logRow) => {
            const exercises = exercisesByLogId.get(logRow.id) ?? []
            return mapToDomain(logRow, exercises)
          })

          return { ok: true, data: { items, totalCount } }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },

    // -------------------------------------------------------------------------
    // listPendingWorkouts - Sessions without logs for dashboard
    // -------------------------------------------------------------------------

    listPendingWorkouts(
      ctx: OrganizationContext,
      filters?: { limit?: number; offset?: number },
    ): ResultAsync<{ items: PendingWorkout[]; totalCount: number }, WorkoutLogRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<
          | { ok: true; data: { items: PendingWorkout[]; totalCount: number } }
          | { ok: false; error: WorkoutLogRepositoryError }
        > => {
          const limit = filters?.limit ?? 50
          const offset = filters?.offset ?? 0

          /**
           * Complex query to find sessions without logs:
           * 1. Get all active programs with athletes assigned
           * 2. For each program, get sessions and weeks
           * 3. LEFT JOIN to workout_logs to find which are missing
           * 4. Return athlete name, program name, session name, week info
           */
          const pendingQuery = sql`
            SELECT DISTINCT
              a.id as athlete_id,
              a.name as athlete_name,
              p.id as program_id,
              p.name as program_name,
              ps.id as session_id,
              ps.name as session_name,
              pw.id as week_id,
              pw.name as week_name,
              pw.order_index as week_order,
              ps.order_index as session_order
            FROM ${programs} p
            INNER JOIN ${athletes} a ON p.athlete_id = a.id
            INNER JOIN ${programWeeks} pw ON pw.program_id = p.id
            INNER JOIN ${programSessions} ps ON ps.program_id = p.id
            LEFT JOIN ${workoutLogs} wl ON
              wl.athlete_id = a.id AND
              wl.session_id = ps.id AND
              wl.week_id = pw.id
            WHERE p.organization_id = ${ctx.organizationId}
              AND p.status = 'active'
              AND p.athlete_id IS NOT NULL
              AND wl.id IS NULL
            ORDER BY a.name, p.name, pw.order_index, ps.order_index
            LIMIT ${limit} OFFSET ${offset}
          `

          const countQuery = sql`
            SELECT COUNT(DISTINCT (a.id, p.id, ps.id, pw.id)) as count
            FROM ${programs} p
            INNER JOIN ${athletes} a ON p.athlete_id = a.id
            INNER JOIN ${programWeeks} pw ON pw.program_id = p.id
            INNER JOIN ${programSessions} ps ON ps.program_id = p.id
            LEFT JOIN ${workoutLogs} wl ON
              wl.athlete_id = a.id AND
              wl.session_id = ps.id AND
              wl.week_id = pw.id
            WHERE p.organization_id = ${ctx.organizationId}
              AND p.status = 'active'
              AND p.athlete_id IS NOT NULL
              AND wl.id IS NULL
          `

          const [pendingRows, countResult] = await Promise.all([db.execute(pendingQuery), db.execute(countQuery)])

          // db.execute returns array of Record<string, unknown>
          const items: PendingWorkout[] = pendingRows.map((row: Record<string, unknown>) => ({
            athleteId: String(row.athlete_id),
            athleteName: String(row.athlete_name),
            programId: String(row.program_id),
            programName: String(row.program_name),
            sessionId: String(row.session_id),
            sessionName: String(row.session_name),
            weekId: String(row.week_id),
            weekName: String(row.week_name),
          }))

          const countRow = countResult[0] as Record<string, unknown> | undefined
          const totalCount = Number(countRow?.count ?? 0)

          return { ok: true, data: { items, totalCount } }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },

    // -------------------------------------------------------------------------
    // delete - Remove workout log (cascade handles logged_exercises)
    // -------------------------------------------------------------------------

    delete(ctx: OrganizationContext, logId: string): ResultAsync<void, WorkoutLogRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: WorkoutLogRepositoryError }> => {
          const prefixedId = ensureLogPrefix(logId)

          // Verify log exists and belongs to organization
          const existingLog = await verifyLogAccess(ctx, prefixedId)
          if (!existingLog) {
            return { ok: false, error: notFoundError(`Workout log not found: ${logId}`) }
          }

          // DELETE from workout_logs (cascade handles logged_exercises)
          await db.delete(workoutLogs).where(eq(workoutLogs.id, prefixedId))

          return { ok: true }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(undefined)
      })
    },
  }
}
