import {
  createProgram,
  hasPermission,
  type OrganizationContext,
  type ProgramRepositoryPort,
  type ProgramWithDetails,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type DuplicateProgramInput = OrganizationContext & {
  sourceProgramId: string
  name: string
  athleteId?: string | null
  isTemplate?: boolean
}

export type DuplicateProgramError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; programId: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  programRepository: ProgramRepositoryPort
  generateId: () => string
}

export const makeDuplicateProgram =
  (deps: Dependencies) =>
  (input: DuplicateProgramInput): ResultAsync<ProgramWithDetails, DuplicateProgramError> => {
    // 1. Authorization FIRST - duplicating creates a new program
    if (!hasPermission(input.memberRole, 'programs:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to create programs',
      })
    }

    const ctx: OrganizationContext = {
      organizationId: input.organizationId,
      userId: input.userId,
      memberRole: input.memberRole,
    }

    // 2. Fetch source program with full details
    return deps.programRepository
      .findWithDetails(ctx, input.sourceProgramId)
      .mapErr((e): DuplicateProgramError => {
        if (e.type === 'NOT_FOUND') {
          return { type: 'not_found', programId: input.sourceProgramId }
        }
        return { type: 'repository_error', message: e.message }
      })
      .andThen((sourceProgram) => {
        // 3. Create new program entity with domain validation
        const newProgramId = deps.generateId()
        const programResult = createProgram({
          id: newProgramId,
          organizationId: input.organizationId,
          name: input.name,
          description: sourceProgram.description,
          athleteId: input.athleteId ?? null,
          isTemplate: input.isTemplate ?? false,
          status: 'draft', // Always reset to draft
        })

        if (programResult.isErr()) {
          return errAsync<ProgramWithDetails, DuplicateProgramError>({
            type: 'validation_error',
            message: programResult.error.message,
          })
        }

        // 4. Persist new program
        return deps.programRepository
          .create(ctx, programResult.value)
          .mapErr(
            (e): DuplicateProgramError => ({
              type: 'repository_error',
              message: e.type === 'DATABASE_ERROR' ? e.message : `Not found: ${e.id}`,
            }),
          )
          .andThen((newProgram) => {
            // 5. Generate ID mapping for all nested entities
            const weekIdMap = new Map<string, string>()
            const sessionIdMap = new Map<string, string>()
            const exerciseRowIdMap = new Map<string, string>()

            // Generate new IDs for weeks
            for (const week of sourceProgram.weeks) {
              weekIdMap.set(week.id, deps.generateId())
            }

            // Generate new IDs for sessions
            for (const session of sourceProgram.sessions) {
              sessionIdMap.set(session.id, deps.generateId())
              // Generate new IDs for exercise rows in this session
              for (const row of session.rows) {
                exerciseRowIdMap.set(row.id, deps.generateId())
                // Generate new IDs for sub-rows
                for (const subRow of row.subRows) {
                  exerciseRowIdMap.set(subRow.id, deps.generateId())
                }
              }
            }

            // 6. Create weeks sequentially
            const createWeeks = (): ResultAsync<void, DuplicateProgramError> => {
              let result: ResultAsync<void, DuplicateProgramError> = okAsync(undefined)

              for (const week of sourceProgram.weeks) {
                const newWeekId = weekIdMap.get(week.id)
                if (!newWeekId) continue

                const now = new Date()
                result = result.andThen(() =>
                  deps.programRepository
                    .createWeek(ctx, newProgram.id, {
                      id: newWeekId,
                      name: week.name,
                      orderIndex: week.orderIndex,
                      createdAt: now,
                      updatedAt: now,
                    })
                    .mapErr(
                      (e): DuplicateProgramError => ({
                        type: 'repository_error',
                        message: e.type === 'DATABASE_ERROR' ? e.message : `Week not found: ${e.id}`,
                      }),
                    )
                    .map(() => undefined),
                )
              }

              return result
            }

            // 7. Create sessions sequentially
            const createSessions = (): ResultAsync<void, DuplicateProgramError> => {
              let result: ResultAsync<void, DuplicateProgramError> = okAsync(undefined)

              for (const session of sourceProgram.sessions) {
                const newSessionId = sessionIdMap.get(session.id)
                if (!newSessionId) continue

                const now = new Date()
                result = result.andThen(() =>
                  deps.programRepository
                    .createSession(ctx, newProgram.id, {
                      id: newSessionId,
                      name: session.name,
                      orderIndex: session.orderIndex,
                      createdAt: now,
                      updatedAt: now,
                    })
                    .mapErr(
                      (e): DuplicateProgramError => ({
                        type: 'repository_error',
                        message: e.type === 'DATABASE_ERROR' ? e.message : `Session not found: ${e.id}`,
                      }),
                    )
                    .map(() => undefined),
                )
              }

              return result
            }

            // 8. Create exercise rows sequentially (with prescriptions)
            const createExerciseRows = (): ResultAsync<void, DuplicateProgramError> => {
              let result: ResultAsync<void, DuplicateProgramError> = okAsync(undefined)

              for (const session of sourceProgram.sessions) {
                const newSessionId = sessionIdMap.get(session.id)
                if (!newSessionId) continue

                for (const row of session.rows) {
                  const newRowId = exerciseRowIdMap.get(row.id)
                  if (!newRowId) continue

                  const now = new Date()
                  result = result.andThen(() =>
                    deps.programRepository
                      .createExerciseRow(ctx, newSessionId, {
                        id: newRowId,
                        exerciseId: row.exerciseId,
                        orderIndex: row.orderIndex,
                        supersetGroup: row.supersetGroup,
                        supersetOrder: row.supersetOrder,
                        setTypeLabel: row.setTypeLabel,
                        isSubRow: false,
                        parentRowId: null,
                        notes: row.notes,
                        restSeconds: row.restSeconds,
                        createdAt: now,
                        updatedAt: now,
                      })
                      .mapErr(
                        (e): DuplicateProgramError => ({
                          type: 'repository_error',
                          message: e.type === 'DATABASE_ERROR' ? e.message : `Row not found: ${e.id}`,
                        }),
                      )
                      .map(() => undefined),
                  )

                  // Create prescriptions for this row
                  for (const [weekId, prescription] of Object.entries(row.prescriptionsByWeekId)) {
                    const newWeekId = weekIdMap.get(weekId)
                    if (!newWeekId) continue

                    const newPrescriptionId = deps.generateId()
                    result = result.andThen(() =>
                      deps.programRepository
                        .upsertPrescription(ctx, newRowId, newWeekId, {
                          ...prescription,
                          id: newPrescriptionId,
                        })
                        .mapErr(
                          (e): DuplicateProgramError => ({
                            type: 'repository_error',
                            message: e.type === 'DATABASE_ERROR' ? e.message : `Entity not found: ${e.id}`,
                          }),
                        ),
                    )
                  }

                  // Create sub-rows
                  for (const subRow of row.subRows) {
                    const newSubRowId = exerciseRowIdMap.get(subRow.id)
                    if (!newSubRowId) continue

                    result = result.andThen(() =>
                      deps.programRepository
                        .createExerciseRow(ctx, newSessionId, {
                          id: newSubRowId,
                          exerciseId: subRow.exerciseId,
                          orderIndex: subRow.orderIndex,
                          supersetGroup: subRow.supersetGroup,
                          supersetOrder: subRow.supersetOrder,
                          setTypeLabel: subRow.setTypeLabel,
                          isSubRow: true,
                          parentRowId: newRowId, // Link to new parent
                          notes: subRow.notes,
                          restSeconds: subRow.restSeconds,
                          createdAt: now,
                          updatedAt: now,
                        })
                        .mapErr(
                          (e): DuplicateProgramError => ({
                            type: 'repository_error',
                            message: e.type === 'DATABASE_ERROR' ? e.message : `SubRow not found: ${e.id}`,
                          }),
                        )
                        .map(() => undefined),
                    )

                    // Create prescriptions for sub-row
                    for (const [weekId, prescription] of Object.entries(subRow.prescriptionsByWeekId)) {
                      const newWeekId = weekIdMap.get(weekId)
                      if (!newWeekId) continue

                      const newPrescriptionId = deps.generateId()
                      result = result.andThen(() =>
                        deps.programRepository
                          .upsertPrescription(ctx, newSubRowId, newWeekId, {
                            ...prescription,
                            id: newPrescriptionId,
                          })
                          .mapErr(
                            (e): DuplicateProgramError => ({
                              type: 'repository_error',
                              message: e.type === 'DATABASE_ERROR' ? e.message : `Entity not found: ${e.id}`,
                            }),
                          ),
                      )
                    }
                  }
                }
              }

              return result
            }

            // 9. Execute all creation steps sequentially
            return createWeeks()
              .andThen(() => createSessions())
              .andThen(() => createExerciseRows())
              .andThen(() =>
                // 10. Return the new program with full details
                deps.programRepository
                  .findWithDetails(ctx, newProgram.id)
                  .mapErr(
                    (e): DuplicateProgramError => ({
                      type: 'repository_error',
                      message: e.type === 'DATABASE_ERROR' ? e.message : `Program not found: ${e.id}`,
                    }),
                  ),
              )
          })
      })
  }
