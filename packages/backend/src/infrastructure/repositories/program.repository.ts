import type {
  ExerciseRowWithPrescriptions,
  OrganizationContext,
  Prescription,
  ProgramExerciseRow,
  ProgramFilters,
  ProgramRepositoryError,
  ProgramRepositoryPort,
  ProgramSession,
  ProgramWeek,
  ProgramWithDetails,
  SessionWithRows,
} from '@strenly/core'
import { createPrescription, createProgram, isProgramStatus, type Program } from '@strenly/core'
import type { DbClient } from '@strenly/database'
import {
  exercises,
  type ParsedPrescription,
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
  entityType: 'program' | 'week' | 'session' | 'exercise_row' | 'prescription',
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
    supersetGroup: row.supersetGroup,
    supersetOrder: row.supersetOrder,
    setTypeLabel: row.setTypeLabel,
    isSubRow: row.isSubRow,
    parentRowId: row.parentRowId,
    notes: row.notes,
    restSeconds: row.restSeconds,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function mapPrescriptionToDomain(parsed: ParsedPrescription, id: string): Prescription | null {
  const result = createPrescription({
    id,
    sets: parsed.sets,
    repsMin: parsed.repsMin,
    repsMax: parsed.repsMax,
    isAmrap: parsed.isAmrap,
    isUnilateral: parsed.isUnilateral,
    unilateralUnit: parsed.unilateralUnit,
    intensityType: parsed.intensityType,
    intensityValue: parsed.intensityValue,
    tempo: parsed.tempo,
  })

  return result.isOk() ? result.value : null
}

function mapPrescriptionToDb(prescription: Prescription): ParsedPrescription {
  // Map intensity type to unit
  let intensityUnit: ParsedPrescription['intensityUnit'] = null
  if (prescription.intensityType === 'absolute') {
    intensityUnit = 'kg'
  } else if (prescription.intensityType === 'percentage') {
    intensityUnit = '%'
  } else if (prescription.intensityType === 'rpe') {
    intensityUnit = 'rpe'
  } else if (prescription.intensityType === 'rir') {
    intensityUnit = 'rir'
  }

  return {
    sets: prescription.sets,
    repsMin: prescription.repsMin,
    repsMax: prescription.repsMax,
    isAmrap: prescription.isAmrap,
    isUnilateral: prescription.isUnilateral,
    unilateralUnit: prescription.unilateralUnit,
    intensityType: prescription.intensityType,
    intensityValue: prescription.intensityValue,
    intensityUnit,
    tempo: prescription.tempo,
  }
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
            const prescription = mapPrescriptionToDomain(prescriptionRow.prescription, prescriptionRow.id)
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
          const exerciseRowsMap = new Map<
            string,
            ExerciseRowWithPrescriptions & { subRows: ExerciseRowWithPrescriptions[] }
          >()
          const subRowsByParent = new Map<string, ExerciseRowWithPrescriptions[]>()

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
              subRows: [],
            }

            if (row.isSubRow && row.parentRowId) {
              let subs = subRowsByParent.get(row.parentRowId)
              if (!subs) {
                subs = []
                subRowsByParent.set(row.parentRowId, subs)
              }
              subs.push(exerciseRow)
            } else {
              exerciseRowsMap.set(row.id, { ...exerciseRow, subRows: [] })
            }
          }

          // Attach sub-rows to parents
          for (const [parentId, subs] of subRowsByParent) {
            const parent = exerciseRowsMap.get(parentId)
            if (parent) {
              parent.subRows = subs
            }
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

          // 9. Build sessions with rows
          const sessions: SessionWithRows[] = sessionRows.map((sessionRow) => ({
            ...mapSessionToDomain(sessionRow),
            rows: rowsBySessionId.get(sessionRow.id) ?? [],
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
    // Exercise Row Operations
    // -------------------------------------------------------------------------

    findExerciseRowById(
      ctx: OrganizationContext,
      rowId: string,
    ): ResultAsync<ProgramExerciseRow, ProgramRepositoryError> {
      return RA.fromPromise(
        verifyExerciseRowAccess(ctx, rowId),
        wrapDbError,
      ).andThen((row) => {
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
              supersetGroup: row.supersetGroup,
              supersetOrder: row.supersetOrder,
              setTypeLabel: row.setTypeLabel,
              isSubRow: row.isSubRow,
              parentRowId: row.parentRowId,
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
              supersetGroup: row.supersetGroup,
              supersetOrder: row.supersetOrder,
              setTypeLabel: row.setTypeLabel,
              isSubRow: row.isSubRow,
              parentRowId: row.parentRowId,
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

    findSubRows(
      ctx: OrganizationContext,
      parentRowId: string,
    ): ResultAsync<ProgramExerciseRow[], ProgramRepositoryError> {
      return RA.fromPromise(
        (async (): Promise<
          { ok: true; data: ProgramExerciseRow[] } | { ok: false; error: ProgramRepositoryError }
        > => {
          // First verify the parent row belongs to the organization
          const parentRow = await verifyExerciseRowAccess(ctx, parentRowId)
          if (!parentRow) {
            return { ok: false, error: notFoundError('exercise_row', parentRowId) }
          }

          // Fetch all sub-rows for this parent
          const rows = await db
            .select()
            .from(programExercises)
            .where(eq(programExercises.parentRowId, parentRowId))
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
            const prescriptionData = mapPrescriptionToDb(prescription)
            await db
              .insert(prescriptions)
              .values({
                id: prescription.id,
                programExerciseId: exerciseRowId,
                weekId,
                prescription: prescriptionData,
              })
              .onConflictDoUpdate({
                target: [prescriptions.programExerciseId, prescriptions.weekId],
                set: {
                  prescription: prescriptionData,
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
              prescription: p.prescription,
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
  }
}
