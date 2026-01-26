import type {
  ExerciseGroupData,
  ExerciseRowWithPrescriptions,
  OrganizationContext,
  Prescription,
  PrescriptionSeriesData,
  ProgramExerciseRow,
  ProgramFilters,
  ProgramRepositoryError,
  ProgramRepositoryPort,
  ProgramSession,
  ProgramWeek,
  ProgramWithDetails,
  SaveDraftInput,
  SessionWithRows,
} from '@strenly/core'
import { createPrescription, createProgram, isProgramStatus, type Program } from '@strenly/core'
import type { DbClient } from '@strenly/database'
import {
  exerciseGroups,
  exercises,
  type PrescriptionSeriesData as DbPrescriptionSeriesData,
  prescriptions,
  programExercises,
  programSessions,
  programs,
  programWeeks,
} from '@strenly/database/schema'
import { and, asc, count, eq, ilike, isNull, sql } from 'drizzle-orm'
import { err, ok, ResultAsync as RA, type ResultAsync } from 'neverthrow'

// ============================================================================
// Error Helpers
// ============================================================================

function wrapDbError(error: unknown): ProgramRepositoryError {
  console.error('Program repository error:', error)
  return { type: 'DATABASE_ERROR', message: 'Database operation failed' }
}

function notFoundError(
  entityType: 'program' | 'week' | 'session' | 'exercise_row' | 'prescription' | 'group',
  id: string,
): ProgramRepositoryError {
  return { type: 'NOT_FOUND', entityType, id }
}

function dbError(message: string): ProgramRepositoryError {
  return { type: 'DATABASE_ERROR', message }
}

// ============================================================================
// Type Inference
// ============================================================================

type ProgramRow = typeof programs.$inferSelect
type WeekRow = typeof programWeeks.$inferSelect
type SessionRow = typeof programSessions.$inferSelect
type ExerciseRowDb = typeof programExercises.$inferSelect
type PrescriptionRow = typeof prescriptions.$inferSelect
type ExerciseGroupRow = typeof exerciseGroups.$inferSelect

// ============================================================================
// Domain Mappers
// ============================================================================

function mapProgramToDomain(row: ProgramRow): Program | null {
  const status = isProgramStatus(row.status) ? row.status : 'draft'

  const result = createProgram({
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    description: row.description,
    athleteId: row.athleteId,
    isTemplate: row.isTemplate,
    status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

  return result.isOk() ? result.value : null
}

function mapWeekToDomain(row: WeekRow): ProgramWeek {
  return {
    id: row.id,
    programId: row.programId,
    name: row.name,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapSessionToDomain(row: SessionRow): ProgramSession {
  return {
    id: row.id,
    programId: row.programId,
    name: row.name,
    orderIndex: row.orderIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapExerciseRowToDomain(row: ExerciseRowDb): ProgramExerciseRow {
  return {
    id: row.id,
    sessionId: row.sessionId,
    exerciseId: row.exerciseId,
    orderIndex: row.orderIndex,
    // Group-based fields
    groupId: row.groupId,
    orderWithinGroup: row.orderWithinGroup,
    // Other fields
    setTypeLabel: row.setTypeLabel,
    notes: row.notes,
    restSeconds: row.restSeconds,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapExerciseGroupToDomain(row: ExerciseGroupRow): ExerciseGroupData {
  return {
    id: row.id,
    sessionId: row.sessionId,
    orderIndex: row.orderIndex,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/**
 * Map series data from database to Prescription domain entity
 * Creates a legacy Prescription from the first series for backward compatibility
 */
function mapSeriesToPrescription(series: DbPrescriptionSeriesData[], id: string): Prescription | null {
  if (series.length === 0) return null

  const firstSeries = series[0]
  if (!firstSeries) return null

  const result = createPrescription({
    id,
    sets: series.length,
    repsMin: firstSeries.reps ?? 0,
    repsMax: firstSeries.repsMax,
    isAmrap: firstSeries.isAmrap,
    isUnilateral: false, // Not used in series model
    unilateralUnit: null,
    intensityType: firstSeries.intensityType,
    intensityValue: firstSeries.intensityValue,
    tempo: firstSeries.tempo,
  })

  return result.isOk() ? result.value : null
}

/**
 * Map Prescription domain entity to series array for database storage
 */
function mapPrescriptionToSeries(prescription: Prescription): DbPrescriptionSeriesData[] {
  const series: DbPrescriptionSeriesData[] = []
  for (let i = 0; i < prescription.sets; i++) {
    series.push({
      orderIndex: i,
      reps: prescription.isAmrap ? null : prescription.repsMin,
      repsMax: prescription.repsMax,
      isAmrap: prescription.isAmrap,
      intensityType: prescription.intensityType,
      intensityValue: prescription.intensityValue,
      intensityUnit: prescription.intensityType === 'absolute'
        ? 'kg'
        : prescription.intensityType === 'percentage'
          ? '%'
          : prescription.intensityType === 'rpe'
            ? 'rpe'
            : prescription.intensityType === 'rir'
              ? 'rir'
              : null,
      tempo: prescription.tempo,
      restSeconds: null,
    })
  }
  return series
}

// ============================================================================
// Repository Factory
// ============================================================================

export function createProgramRepository(db: DbClient): ProgramRepositoryPort {
  /**
   * Helper to verify a program exists and belongs to the organization.
   * Used for nested operations that need to validate ownership.
   */
  async function verifyProgramAccess(ctx: OrganizationContext, programId: string): Promise<ProgramRow | null> {
    const rows = await db
      .select()
      .from(programs)
      .where(and(eq(programs.id, programId), eq(programs.organizationId, ctx.organizationId)))

    return rows[0] ?? null
  }

  /**
   * Helper to verify a week exists and belongs to the organization.
   */
  async function verifyWeekAccess(ctx: OrganizationContext, weekId: string): Promise<WeekRow | null> {
    const rows = await db
      .select({ week: programWeeks, program: programs })
      .from(programWeeks)
      .innerJoin(programs, eq(programWeeks.programId, programs.id))
      .where(and(eq(programWeeks.id, weekId), eq(programs.organizationId, ctx.organizationId)))

    return rows[0]?.week ?? null
  }

  /**
   * Helper to verify a session exists and belongs to the organization.
   */
  async function verifySessionAccess(ctx: OrganizationContext, sessionId: string): Promise<SessionRow | null> {
    const rows = await db
      .select({ session: programSessions, program: programs })
      .from(programSessions)
      .innerJoin(programs, eq(programSessions.programId, programs.id))
      .where(and(eq(programSessions.id, sessionId), eq(programs.organizationId, ctx.organizationId)))

    return rows[0]?.session ?? null
  }

  /**
   * Helper to verify an exercise row exists and belongs to the organization.
   */
  async function verifyExerciseRowAccess(ctx: OrganizationContext, rowId: string): Promise<ExerciseRowDb | null> {
    const rows = await db
      .select({ row: programExercises, program: programs })
      .from(programExercises)
      .innerJoin(programSessions, eq(programExercises.sessionId, programSessions.id))
      .innerJoin(programs, eq(programSessions.programId, programs.id))
      .where(and(eq(programExercises.id, rowId), eq(programs.organizationId, ctx.organizationId)))

    return rows[0]?.row ?? null
  }

  /**
   * Helper to verify an exercise group exists and belongs to the organization.
   */
  async function verifyGroupAccess(ctx: OrganizationContext, groupId: string): Promise<ExerciseGroupRow | null> {
    const rows = await db
      .select({ group: exerciseGroups, program: programs })
      .from(exerciseGroups)
      .innerJoin(programSessions, eq(exerciseGroups.sessionId, programSessions.id))
      .innerJoin(programs, eq(programSessions.programId, programs.id))
      .where(and(eq(exerciseGroups.id, groupId), eq(programs.organizationId, ctx.organizationId)))

    return rows[0]?.group ?? null
  }

  return {
    // -------------------------------------------------------------------------
    // Program CRUD
    // -------------------------------------------------------------------------

    create(ctx: OrganizationContext, program: Program): ResultAsync<Program, ProgramRepositoryError> {
      return RA.fromPromise(
        db
          .insert(programs)
          .values({
            id: program.id,
            organizationId: ctx.organizationId,
            name: program.name,
            description: program.description,
            athleteId: program.athleteId,
            isTemplate: program.isTemplate,
            status: program.status,
            createdAt: program.createdAt,
            updatedAt: program.updatedAt,
          })
          .returning()
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return err(dbError('Failed to create program'))
        }
        const created = mapProgramToDomain(row)
        if (!created) {
          return err(dbError('Invalid program data after create'))
        }
        return ok(created)
      })
    },

    findById(ctx: OrganizationContext, id: string): ResultAsync<Program, ProgramRepositoryError> {
      return RA.fromPromise(
        db
          .select()
          .from(programs)
          .where(and(eq(programs.id, id), eq(programs.organizationId, ctx.organizationId)))
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return err(notFoundError('program', id))
        }
        const program = mapProgramToDomain(row)
        if (!program) {
          return err(dbError('Invalid program data'))
        }
        return ok(program)
      })
    },

    update(ctx: OrganizationContext, program: Program): ResultAsync<Program, ProgramRepositoryError> {
      return RA.fromPromise(
        db
          .update(programs)
          .set({
            name: program.name,
            description: program.description,
            athleteId: program.athleteId,
            isTemplate: program.isTemplate,
            status: program.status,
            updatedAt: new Date(),
          })
          .where(and(eq(programs.id, program.id), eq(programs.organizationId, ctx.organizationId)))
          .returning()
          .then((rows) => rows[0]),
        wrapDbError,
      ).andThen((row) => {
        if (!row) {
          return err(notFoundError('program', program.id))
        }
        const updated = mapProgramToDomain(row)
        if (!updated) {
          return err(dbError('Invalid program data after update'))
        }
        return ok(updated)
      })
    },

    list(
      ctx: OrganizationContext,
      filters?: ProgramFilters,
    ): ResultAsync<{ items: Program[]; totalCount: number }, ProgramRepositoryError> {
      return RA.fromPromise(
        (async () => {
          const conditions = [eq(programs.organizationId, ctx.organizationId)]

          if (filters?.status) {
            conditions.push(eq(programs.status, filters.status))
          }

          if (filters?.athleteId !== undefined) {
            if (filters.athleteId === null) {
              conditions.push(isNull(programs.athleteId))
            } else {
              conditions.push(eq(programs.athleteId, filters.athleteId))
            }
          }

          if (filters?.isTemplate !== undefined) {
            conditions.push(eq(programs.isTemplate, filters.isTemplate))
          }

          if (filters?.search) {
            conditions.push(ilike(programs.name, `%${filters.search}%`))
          }

          const whereClause = and(...conditions)

          const [countResult, rows] = await Promise.all([
            db.select({ count: count() }).from(programs).where(whereClause),
            db
              .select()
              .from(programs)
              .where(whereClause)
              .orderBy(asc(programs.name))
              .limit(filters?.limit ?? 100)
              .offset(filters?.offset ?? 0),
          ])

          const items = rows.map(mapProgramToDomain).filter((p): p is Program => p !== null)

          return { items, totalCount: countResult[0]?.count ?? 0 }
        })(),
        wrapDbError,
      )
    },

    findWithDetails(ctx: OrganizationContext, id: string): ResultAsync<ProgramWithDetails, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: ProgramWithDetails } | { ok: false; error: ProgramRepositoryError }> => {
          // 1. Fetch program
          const programRows = await db
            .select()
            .from(programs)
            .where(and(eq(programs.id, id), eq(programs.organizationId, ctx.organizationId)))

          const programRow = programRows[0]
          if (!programRow) {
            return { ok: false, error: notFoundError('program', id) }
          }

          const program = mapProgramToDomain(programRow)
          if (!program) {
            return { ok: false, error: dbError('Invalid program data') }
          }

          // 2. Fetch weeks
          const weekRows = await db
            .select()
            .from(programWeeks)
            .where(eq(programWeeks.programId, id))
            .orderBy(asc(programWeeks.orderIndex))

          const weeks = weekRows.map(mapWeekToDomain)

          // 3. Fetch sessions
          const sessionRows = await db
            .select()
            .from(programSessions)
            .where(eq(programSessions.programId, id))
            .orderBy(asc(programSessions.orderIndex))

          // 3.5. Fetch exercise groups for all sessions
          const sessionIds = sessionRows.map((s) => s.id)
          let groupRows: ExerciseGroupRow[] = []
          if (sessionIds.length > 0) {
            groupRows = await db
              .select()
              .from(exerciseGroups)
              .where(
                sql`${exerciseGroups.sessionId} IN (${sql.join(
                  sessionIds.map((sId) => sql`${sId}`),
                  sql`, `,
                )})`,
              )
              .orderBy(asc(exerciseGroups.orderIndex))
          }

          // Group exercise groups by session ID
          const groupsBySessionId = new Map<string, ExerciseGroupData[]>()
          for (const groupRow of groupRows) {
            const group = mapExerciseGroupToDomain(groupRow)
            let sessionGroupList = groupsBySessionId.get(groupRow.sessionId)
            if (!sessionGroupList) {
              sessionGroupList = []
              groupsBySessionId.set(groupRow.sessionId, sessionGroupList)
            }
            sessionGroupList.push(group)
          }

          // 4. Fetch exercise rows with exercise names
          const exerciseRowResults = await db
            .select({
              row: programExercises,
              exerciseName: exercises.name,
            })
            .from(programExercises)
            .innerJoin(programSessions, eq(programExercises.sessionId, programSessions.id))
            .innerJoin(exercises, eq(programExercises.exerciseId, exercises.id))
            .where(eq(programSessions.programId, id))
            .orderBy(asc(programExercises.orderIndex))

          // 5. Fetch all prescriptions for all exercise rows
          const exerciseRowIds = exerciseRowResults.map((r) => r.row.id)
          let prescriptionRows: PrescriptionRow[] = []

          if (exerciseRowIds.length > 0) {
            prescriptionRows = await db
              .select()
              .from(prescriptions)
              .where(
                sql`${prescriptions.programExerciseId} IN (${sql.join(
                  exerciseRowIds.map((rowId) => sql`${rowId}`),
                  sql`, `,
                )})`,
              )
          }

          // 6. Group prescriptions by exercise row ID
          const prescriptionsByRowId = new Map<string, Map<string, Prescription>>()
          for (const prescriptionRow of prescriptionRows) {
            const prescription = mapSeriesToPrescription(prescriptionRow.series, prescriptionRow.id)
            if (prescription) {
              let rowMap = prescriptionsByRowId.get(prescriptionRow.programExerciseId)
              if (!rowMap) {
                rowMap = new Map()
                prescriptionsByRowId.set(prescriptionRow.programExerciseId, rowMap)
              }
              rowMap.set(prescriptionRow.weekId, prescription)
            }
          }

          // 7. Build exercise rows with prescriptions
          const exerciseRowsMap = new Map<string, ExerciseRowWithPrescriptions>()

          for (const { row, exerciseName } of exerciseRowResults) {
            const prescriptionMap = prescriptionsByRowId.get(row.id)
            const prescriptionsByWeekId: Record<string, Prescription> = {}
            if (prescriptionMap) {
              for (const [weekId, prescription] of prescriptionMap) {
                prescriptionsByWeekId[weekId] = prescription
              }
            }

            const exerciseRow: ExerciseRowWithPrescriptions = {
              ...mapExerciseRowToDomain(row),
              exerciseName,
              prescriptionsByWeekId,
            }

            exerciseRowsMap.set(row.id, exerciseRow)
          }

          // 8. Group exercise rows by session
          const rowsBySessionId = new Map<string, ExerciseRowWithPrescriptions[]>()
          for (const row of exerciseRowsMap.values()) {
            let sessionExerciseRows = rowsBySessionId.get(row.sessionId)
            if (!sessionExerciseRows) {
              sessionExerciseRows = []
              rowsBySessionId.set(row.sessionId, sessionExerciseRows)
            }
            sessionExerciseRows.push(row)
          }

          // 9. Build sessions with rows and exercise groups
          const sessions: SessionWithRows[] = sessionRows.map((sessionRow) => ({
            ...mapSessionToDomain(sessionRow),
            rows: rowsBySessionId.get(sessionRow.id) ?? [],
            exerciseGroups: groupsBySessionId.get(sessionRow.id) ?? [],
          }))

          return {
            ok: true,
            data: {
              ...program,
              weeks,
              sessions,
            },
          }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },

    listTemplates(ctx: OrganizationContext): ResultAsync<Program[], ProgramRepositoryError> {
      return RA.fromPromise(
        db
          .select()
          .from(programs)
          .where(and(eq(programs.organizationId, ctx.organizationId), eq(programs.isTemplate, true)))
          .orderBy(asc(programs.name)),
        wrapDbError,
      ).map((rows) => rows.map(mapProgramToDomain).filter((p): p is Program => p !== null))
    },

    // -------------------------------------------------------------------------
    // Week Operations
    // -------------------------------------------------------------------------

    createWeek(
      ctx: OrganizationContext,
      programId: string,
      week: Omit<ProgramWeek, 'programId'>,
    ): ResultAsync<ProgramWeek, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: WeekRow } | { ok: false; error: ProgramRepositoryError }> => {
          const programRow = await verifyProgramAccess(ctx, programId)
          if (!programRow) {
            return { ok: false, error: notFoundError('program', programId) }
          }

          const rows = await db
            .insert(programWeeks)
            .values({
              id: week.id,
              programId,
              name: week.name,
              orderIndex: week.orderIndex,
              createdAt: week.createdAt,
              updatedAt: week.updatedAt,
            })
            .returning()

          const row = rows[0]
          if (!row) {
            return { ok: false, error: dbError('Failed to create week') }
          }

          return { ok: true, data: row }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapWeekToDomain(result.data))
      })
    },

    findWeekById(ctx: OrganizationContext, weekId: string): ResultAsync<ProgramWeek, ProgramRepositoryError> {
      return RA.fromPromise(verifyWeekAccess(ctx, weekId), wrapDbError).andThen((row) => {
        if (!row) {
          return err(notFoundError('week', weekId))
        }
        return ok(mapWeekToDomain(row))
      })
    },

    updateWeek(ctx: OrganizationContext, week: ProgramWeek): ResultAsync<ProgramWeek, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: WeekRow } | { ok: false; error: ProgramRepositoryError }> => {
          const existingWeek = await verifyWeekAccess(ctx, week.id)
          if (!existingWeek) {
            return { ok: false, error: notFoundError('week', week.id) }
          }

          const rows = await db
            .update(programWeeks)
            .set({
              name: week.name,
              orderIndex: week.orderIndex,
              updatedAt: new Date(),
            })
            .where(eq(programWeeks.id, week.id))
            .returning()

          const row = rows[0]
          if (!row) {
            return { ok: false, error: dbError('Failed to update week') }
          }

          return { ok: true, data: row }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapWeekToDomain(result.data))
      })
    },

    deleteWeek(ctx: OrganizationContext, weekId: string): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          const existingWeek = await verifyWeekAccess(ctx, weekId)
          if (!existingWeek) {
            return { ok: false, error: notFoundError('week', weekId) }
          }

          // Cascading delete handles prescriptions automatically
          await db.delete(programWeeks).where(eq(programWeeks.id, weekId))
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
    // Session Operations
    // -------------------------------------------------------------------------

    createSession(
      ctx: OrganizationContext,
      programId: string,
      session: Omit<ProgramSession, 'programId'>,
    ): ResultAsync<ProgramSession, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: SessionRow } | { ok: false; error: ProgramRepositoryError }> => {
          const programRow = await verifyProgramAccess(ctx, programId)
          if (!programRow) {
            return { ok: false, error: notFoundError('program', programId) }
          }

          const rows = await db
            .insert(programSessions)
            .values({
              id: session.id,
              programId,
              name: session.name,
              orderIndex: session.orderIndex,
              createdAt: session.createdAt,
              updatedAt: session.updatedAt,
            })
            .returning()

          const row = rows[0]
          if (!row) {
            return { ok: false, error: dbError('Failed to create session') }
          }

          return { ok: true, data: row }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapSessionToDomain(result.data))
      })
    },

    updateSession(
      ctx: OrganizationContext,
      session: ProgramSession,
    ): ResultAsync<ProgramSession, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: SessionRow } | { ok: false; error: ProgramRepositoryError }> => {
          const existingSession = await verifySessionAccess(ctx, session.id)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', session.id) }
          }

          const rows = await db
            .update(programSessions)
            .set({
              name: session.name,
              orderIndex: session.orderIndex,
              updatedAt: new Date(),
            })
            .where(eq(programSessions.id, session.id))
            .returning()

          const row = rows[0]
          if (!row) {
            return { ok: false, error: dbError('Failed to update session') }
          }

          return { ok: true, data: row }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapSessionToDomain(result.data))
      })
    },

    deleteSession(ctx: OrganizationContext, sessionId: string): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          // Cascading delete handles exercise rows and prescriptions automatically
          await db.delete(programSessions).where(eq(programSessions.id, sessionId))
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
    // Exercise Group Operations
    // -------------------------------------------------------------------------

    createGroup(
      ctx: OrganizationContext,
      sessionId: string,
      name?: string | null,
    ): ResultAsync<ExerciseGroupData, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: ExerciseGroupRow } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify session access
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          // Get next order index
          const maxOrderResult = await db
            .select({ maxOrder: sql<number>`COALESCE(MAX(${exerciseGroups.orderIndex}), -1)` })
            .from(exerciseGroups)
            .where(eq(exerciseGroups.sessionId, sessionId))

          const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1

          // Insert new group
          const rows = await db
            .insert(exerciseGroups)
            .values({
              id: `eg-${crypto.randomUUID()}`,
              sessionId,
              orderIndex: nextOrder,
              name: name ?? null,
            })
            .returning()

          const row = rows[0]
          if (!row) {
            return { ok: false, error: dbError('Failed to create exercise group') }
          }

          return { ok: true, data: row }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapExerciseGroupToDomain(result.data))
      })
    },

    updateGroup(
      ctx: OrganizationContext,
      groupId: string,
      updates: { name?: string | null; orderIndex?: number },
    ): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify group access
          const existingGroup = await verifyGroupAccess(ctx, groupId)
          if (!existingGroup) {
            return { ok: false, error: notFoundError('group', groupId) }
          }

          // Build update object
          const updateData: Partial<{ name: string | null; orderIndex: number; updatedAt: Date }> = {
            updatedAt: new Date(),
          }
          if (updates.name !== undefined) {
            updateData.name = updates.name
          }
          if (updates.orderIndex !== undefined) {
            updateData.orderIndex = updates.orderIndex
          }

          await db.update(exerciseGroups).set(updateData).where(eq(exerciseGroups.id, groupId))

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

    deleteGroup(ctx: OrganizationContext, groupId: string): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify group access
          const existingGroup = await verifyGroupAccess(ctx, groupId)
          if (!existingGroup) {
            return { ok: false, error: notFoundError('group', groupId) }
          }

          // Note: exercises with this groupId will have their groupId set to NULL due to onDelete: setNull
          await db.delete(exerciseGroups).where(eq(exerciseGroups.id, groupId))

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

    getMaxGroupOrderIndex(ctx: OrganizationContext, sessionId: string): ResultAsync<number, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: number } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify session access
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          const result = await db
            .select({ maxOrder: sql<number>`COALESCE(MAX(${exerciseGroups.orderIndex}), -1)` })
            .from(exerciseGroups)
            .where(eq(exerciseGroups.sessionId, sessionId))

          return { ok: true, data: result[0]?.maxOrder ?? -1 }
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
    // Exercise Row Operations
    // -------------------------------------------------------------------------

    findExerciseRowById(
      ctx: OrganizationContext,
      rowId: string,
    ): ResultAsync<ProgramExerciseRow, ProgramRepositoryError> {
      return RA.fromPromise(verifyExerciseRowAccess(ctx, rowId), wrapDbError).andThen((row) => {
        if (!row) {
          return err(notFoundError('exercise_row', rowId))
        }
        return ok(mapExerciseRowToDomain(row))
      })
    },

    getMaxExerciseRowOrderIndex(
      ctx: OrganizationContext,
      sessionId: string,
    ): ResultAsync<number, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: number } | { ok: false; error: ProgramRepositoryError }> => {
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          const result = await db
            .select({ maxOrder: sql<number>`COALESCE(MAX(${programExercises.orderIndex}), -1)` })
            .from(programExercises)
            .where(eq(programExercises.sessionId, sessionId))

          return { ok: true, data: result[0]?.maxOrder ?? -1 }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },

    createExerciseRow(
      ctx: OrganizationContext,
      sessionId: string,
      row: Omit<ProgramExerciseRow, 'sessionId'>,
    ): ResultAsync<ProgramExerciseRow, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: ExerciseRowDb } | { ok: false; error: ProgramRepositoryError }> => {
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          const rows = await db
            .insert(programExercises)
            .values({
              id: row.id,
              sessionId,
              exerciseId: row.exerciseId,
              orderIndex: row.orderIndex,
              groupId: row.groupId,
              orderWithinGroup: row.orderWithinGroup,
              setTypeLabel: row.setTypeLabel,
              notes: row.notes,
              restSeconds: row.restSeconds,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
            })
            .returning()

          const insertedRow = rows[0]
          if (!insertedRow) {
            return { ok: false, error: dbError('Failed to create exercise row') }
          }

          return { ok: true, data: insertedRow }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapExerciseRowToDomain(result.data))
      })
    },

    updateExerciseRow(
      ctx: OrganizationContext,
      row: ProgramExerciseRow,
    ): ResultAsync<ProgramExerciseRow, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: ExerciseRowDb } | { ok: false; error: ProgramRepositoryError }> => {
          const existingRow = await verifyExerciseRowAccess(ctx, row.id)
          if (!existingRow) {
            return { ok: false, error: notFoundError('exercise_row', row.id) }
          }

          const rows = await db
            .update(programExercises)
            .set({
              exerciseId: row.exerciseId,
              orderIndex: row.orderIndex,
              groupId: row.groupId,
              orderWithinGroup: row.orderWithinGroup,
              setTypeLabel: row.setTypeLabel,
              notes: row.notes,
              restSeconds: row.restSeconds,
              updatedAt: new Date(),
            })
            .where(eq(programExercises.id, row.id))
            .returning()

          const updatedRow = rows[0]
          if (!updatedRow) {
            return { ok: false, error: dbError('Failed to update exercise row') }
          }

          return { ok: true, data: updatedRow }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapExerciseRowToDomain(result.data))
      })
    },

    deleteExerciseRow(ctx: OrganizationContext, rowId: string): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          const existingRow = await verifyExerciseRowAccess(ctx, rowId)
          if (!existingRow) {
            return { ok: false, error: notFoundError('exercise_row', rowId) }
          }

          // Cascading delete handles prescriptions automatically
          await db.delete(programExercises).where(eq(programExercises.id, rowId))
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
    // Prescription Operations (Cell Values)
    // -------------------------------------------------------------------------

    upsertPrescription(
      ctx: OrganizationContext,
      exerciseRowId: string,
      weekId: string,
      prescription: Prescription | null,
    ): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify exercise row access
          const existingRow = await verifyExerciseRowAccess(ctx, exerciseRowId)
          if (!existingRow) {
            return { ok: false, error: notFoundError('exercise_row', exerciseRowId) }
          }

          // Verify week access (also validates org ownership)
          const existingWeek = await verifyWeekAccess(ctx, weekId)
          if (!existingWeek) {
            return { ok: false, error: notFoundError('week', weekId) }
          }

          if (prescription === null) {
            // Delete the prescription
            await db
              .delete(prescriptions)
              .where(and(eq(prescriptions.programExerciseId, exerciseRowId), eq(prescriptions.weekId, weekId)))
          } else {
            // Upsert the prescription using ON CONFLICT
            const seriesData = mapPrescriptionToSeries(prescription)
            await db
              .insert(prescriptions)
              .values({
                id: prescription.id,
                programExerciseId: exerciseRowId,
                weekId,
                series: seriesData,
              })
              .onConflictDoUpdate({
                target: [prescriptions.programExerciseId, prescriptions.weekId],
                set: {
                  series: seriesData,
                  updatedAt: new Date(),
                },
              })
          }

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

    updatePrescriptionSeries(
      ctx: OrganizationContext,
      exerciseRowId: string,
      weekId: string,
      series: PrescriptionSeriesData[],
    ): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify exercise row access
          const existingRow = await verifyExerciseRowAccess(ctx, exerciseRowId)
          if (!existingRow) {
            return { ok: false, error: notFoundError('exercise_row', exerciseRowId) }
          }

          // Verify week access
          const existingWeek = await verifyWeekAccess(ctx, weekId)
          if (!existingWeek) {
            return { ok: false, error: notFoundError('week', weekId) }
          }

          if (series.length === 0) {
            // Delete the prescription if series is empty
            await db
              .delete(prescriptions)
              .where(and(eq(prescriptions.programExerciseId, exerciseRowId), eq(prescriptions.weekId, weekId)))
          } else {
            // Store series directly
            const seriesData = series.map((s, i) => ({
              orderIndex: i,
              reps: s.reps,
              repsMax: s.repsMax,
              isAmrap: s.isAmrap,
              intensityType: s.intensityType,
              intensityValue: s.intensityValue,
              intensityUnit: s.intensityUnit,
              tempo: s.tempo,
              restSeconds: s.restSeconds,
            }))

            await db
              .insert(prescriptions)
              .values({
                id: `rx-${crypto.randomUUID()}`,
                programExerciseId: exerciseRowId,
                weekId,
                series: seriesData,
              })
              .onConflictDoUpdate({
                target: [prescriptions.programExerciseId, prescriptions.weekId],
                set: {
                  series: seriesData,
                  updatedAt: new Date(),
                },
              })
          }

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
    // Bulk Operations
    // -------------------------------------------------------------------------

    saveDraft(
      ctx: OrganizationContext,
      input: SaveDraftInput,
    ): ResultAsync<{ updatedAt: Date }, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: { updatedAt: Date } } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify program access
          const existingProgram = await verifyProgramAccess(ctx, input.programId)
          if (!existingProgram) {
            return { ok: false, error: notFoundError('program', input.programId) }
          }

          const updatedAt = new Date()

          await db.transaction(async (tx) => {
            // Update prescriptions with series
            if (input.prescriptionUpdates && input.prescriptionUpdates.length > 0) {
              for (const update of input.prescriptionUpdates) {
                if (update.series.length === 0) {
                  // Delete the prescription if series is empty
                  await tx
                    .delete(prescriptions)
                    .where(
                      and(
                        eq(prescriptions.programExerciseId, update.exerciseRowId),
                        eq(prescriptions.weekId, update.weekId),
                      ),
                    )
                } else {
                  // Store series directly
                  const seriesData = update.series.map((s, i) => ({
                    orderIndex: i,
                    reps: s.reps,
                    repsMax: s.repsMax,
                    isAmrap: s.isAmrap,
                    intensityType: s.intensityType,
                    intensityValue: s.intensityValue,
                    intensityUnit: s.intensityUnit,
                    tempo: s.tempo,
                    restSeconds: s.restSeconds,
                  }))

                  await tx
                    .insert(prescriptions)
                    .values({
                      id: `rx-${crypto.randomUUID()}`,
                      programExerciseId: update.exerciseRowId,
                      weekId: update.weekId,
                      series: seriesData,
                    })
                    .onConflictDoUpdate({
                      target: [prescriptions.programExerciseId, prescriptions.weekId],
                      set: {
                        series: seriesData,
                        updatedAt,
                      },
                    })
                }
              }
            }

            // Update exercise rows
            if (input.exerciseRowUpdates && input.exerciseRowUpdates.length > 0) {
              for (const update of input.exerciseRowUpdates) {
                const updateData: Partial<{
                  exerciseId: string
                  groupId: string | null
                  orderWithinGroup: number | null
                  updatedAt: Date
                }> = { updatedAt }

                if (update.exerciseId !== undefined) {
                  updateData.exerciseId = update.exerciseId
                }
                if (update.groupId !== undefined) {
                  updateData.groupId = update.groupId
                }
                if (update.orderWithinGroup !== undefined) {
                  updateData.orderWithinGroup = update.orderWithinGroup
                }

                await tx.update(programExercises).set(updateData).where(eq(programExercises.id, update.rowId))
              }
            }

            // Update groups
            if (input.groupUpdates && input.groupUpdates.length > 0) {
              for (const update of input.groupUpdates) {
                const updateData: Partial<{ name: string | null; orderIndex: number; updatedAt: Date }> = { updatedAt }

                if (update.name !== undefined) {
                  updateData.name = update.name
                }
                if (update.orderIndex !== undefined) {
                  updateData.orderIndex = update.orderIndex
                }

                await tx.update(exerciseGroups).set(updateData).where(eq(exerciseGroups.id, update.groupId))
              }
            }

            // Update program.updatedAt
            await tx.update(programs).set({ updatedAt }).where(eq(programs.id, input.programId))
          })

          return { ok: true, data: { updatedAt } }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },

    reorderExerciseRows(
      ctx: OrganizationContext,
      sessionId: string,
      rowIds: string[],
    ): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          // Update each row's orderIndex
          await db.transaction(async (tx) => {
            for (let i = 0; i < rowIds.length; i++) {
              const currentRowId = rowIds[i]
              if (currentRowId) {
                await tx
                  .update(programExercises)
                  .set({ orderIndex: i, updatedAt: new Date() })
                  .where(and(eq(programExercises.id, currentRowId), eq(programExercises.sessionId, sessionId)))
              }
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

    duplicateWeek(
      ctx: OrganizationContext,
      weekId: string,
      newName: string,
    ): ResultAsync<ProgramWeek, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: WeekRow } | { ok: false; error: ProgramRepositoryError }> => {
          const existingWeek = await verifyWeekAccess(ctx, weekId)
          if (!existingWeek) {
            return { ok: false, error: notFoundError('week', weekId) }
          }

          // Get the next order index for the new week
          const maxOrderResult = await db
            .select({ maxOrder: sql<number>`MAX(${programWeeks.orderIndex})` })
            .from(programWeeks)
            .where(eq(programWeeks.programId, existingWeek.programId))

          const nextOrder = (maxOrderResult[0]?.maxOrder ?? 0) + 1

          // Create new week
          const newWeekId = `week-${crypto.randomUUID()}`
          const insertedWeeks = await db
            .insert(programWeeks)
            .values({
              id: newWeekId,
              programId: existingWeek.programId,
              name: newName,
              orderIndex: nextOrder,
            })
            .returning()

          const newWeekRow = insertedWeeks[0]
          if (!newWeekRow) {
            return { ok: false, error: dbError('Failed to create duplicate week') }
          }

          // Copy all prescriptions from the source week
          const sourcePrescriptions = await db.select().from(prescriptions).where(eq(prescriptions.weekId, weekId))

          if (sourcePrescriptions.length > 0) {
            const newPrescriptions = sourcePrescriptions.map((p) => ({
              id: `rx-${crypto.randomUUID()}`,
              programExerciseId: p.programExerciseId,
              weekId: newWeekId,
              series: p.series,
            }))

            await db.insert(prescriptions).values(newPrescriptions)
          }

          return { ok: true, data: newWeekRow }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(mapWeekToDomain(result.data))
      })
    },

    repositionRowToEndOfSession(
      ctx: OrganizationContext,
      sessionId: string,
      rowId: string,
    ): ResultAsync<void, ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true } | { ok: false; error: ProgramRepositoryError }> => {
          // Verify session access
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          // 1. Get all rows in session ordered by orderIndex
          const sessionRows = await db
            .select({
              id: programExercises.id,
              orderIndex: programExercises.orderIndex,
            })
            .from(programExercises)
            .where(eq(programExercises.sessionId, sessionId))
            .orderBy(asc(programExercises.orderIndex))

          // 2. Find the current row position
          const currentIndex = sessionRows.findIndex((r) => r.id === rowId)
          if (currentIndex === -1) {
            return { ok: true } // Row not found in session, nothing to do
          }

          // 3. If already at end, no repositioning needed
          if (currentIndex === sessionRows.length - 1) {
            return { ok: true }
          }

          // 4. Build new order: remove the row, append to end
          const currentRow = sessionRows[currentIndex]
          if (!currentRow) {
            return { ok: true }
          }
          const newOrder = sessionRows.filter((r) => r.id !== rowId)
          newOrder.push(currentRow)

          // 5. Update all orderIndex values
          await db.transaction(async (tx) => {
            for (let i = 0; i < newOrder.length; i++) {
              const row = newOrder[i]
              if (row) {
                await tx
                  .update(programExercises)
                  .set({ orderIndex: i, updatedAt: new Date() })
                  .where(eq(programExercises.id, row.id))
              }
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

    findExerciseRowsBySessionId(
      ctx: OrganizationContext,
      sessionId: string,
    ): ResultAsync<ProgramExerciseRow[], ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<{ ok: true; data: ProgramExerciseRow[] } | { ok: false; error: ProgramRepositoryError }> => {
          const existingSession = await verifySessionAccess(ctx, sessionId)
          if (!existingSession) {
            return { ok: false, error: notFoundError('session', sessionId) }
          }

          const rows = await db
            .select()
            .from(programExercises)
            .where(eq(programExercises.sessionId, sessionId))
            .orderBy(asc(programExercises.orderIndex))

          return { ok: true, data: rows.map(mapExerciseRowToDomain) }
        })(),
        wrapDbError,
      ).andThen((result) => {
        if (!result.ok) {
          return err(result.error)
        }
        return ok(result.data)
      })
    },
  }
}
