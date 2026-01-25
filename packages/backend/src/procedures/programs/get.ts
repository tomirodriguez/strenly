import { getProgramInputSchema, programWithDetailsSchema } from '@strenly/contracts/programs'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeGetProgram } from '../../use-cases/programs/get-program'

/**
 * Get a program with full details for grid view
 * Requires authentication and programs:read permission
 */
export const getProgram = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to view programs' },
    NOT_FOUND: { message: 'Program not found' },
  })
  .input(getProgramInputSchema)
  .output(programWithDetailsSchema)
  .handler(async ({ input, context, errors }) => {
    const getProgramUseCase = makeGetProgram({
      programRepository: createProgramRepository(context.db),
    })

    const result = await getProgramUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      programId: input.programId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'not_found':
          throw errors.NOT_FOUND({ message: `Program ${result.error.programId} not found` })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const program = result.value

    return {
      id: program.id,
      organizationId: program.organizationId,
      name: program.name,
      description: program.description,
      athleteId: program.athleteId,
      isTemplate: program.isTemplate,
      status: program.status,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
      weeks: program.weeks.map((week) => ({
        id: week.id,
        programId: week.programId,
        name: week.name,
        orderIndex: week.orderIndex,
        createdAt: week.createdAt.toISOString(),
        updatedAt: week.updatedAt.toISOString(),
      })),
      sessions: program.sessions.map((session) => ({
        id: session.id,
        programId: session.programId,
        name: session.name,
        orderIndex: session.orderIndex,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        rows: session.rows.map((row) => mapExerciseRow(row)),
        exerciseGroups: session.exerciseGroups?.map((group) => ({
          id: group.id,
          sessionId: group.sessionId,
          orderIndex: group.orderIndex,
          name: group.name,
        })),
      })),
    }
  })

/**
 * Maps an exercise row from domain to contract format
 */
function mapExerciseRow(row: {
  id: string
  sessionId: string
  exerciseId: string
  exerciseName: string
  orderIndex: number
  groupId: string | null
  orderWithinGroup: number | null
  supersetGroup: string | null
  supersetOrder: number | null
  setTypeLabel: string | null
  isSubRow: boolean
  parentRowId: string | null
  notes: string | null
  restSeconds: number | null
  prescriptionsByWeekId: Record<
    string,
    {
      id: string
      sets: number
      repsMin: number
      repsMax: number | null
      isAmrap: boolean
      isUnilateral: boolean
      unilateralUnit: 'leg' | 'arm' | 'side' | null
      intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
      intensityValue: number | null
      tempo: string | null
    }
  >
  subRows: (typeof row)[]
  createdAt: Date
  updatedAt: Date
}): {
  id: string
  sessionId: string
  exerciseId: string
  exerciseName: string
  orderIndex: number
  groupId: string | null
  orderWithinGroup: number | null
  supersetGroup: string | null
  supersetOrder: number | null
  setTypeLabel: string | null
  isSubRow: boolean
  parentRowId: string | null
  notes: string | null
  restSeconds: number | null
  prescriptionsByWeekId: Record<
    string,
    {
      id: string
      sets: number
      repsMin: number
      repsMax: number | null
      isAmrap: boolean
      isUnilateral: boolean
      unilateralUnit: 'leg' | 'arm' | 'side' | null
      intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
      intensityValue: number | null
      tempo: string | null
    }
  >
  subRows: ReturnType<typeof mapExerciseRow>[]
  createdAt: string
  updatedAt: string
} {
  return {
    id: row.id,
    sessionId: row.sessionId,
    exerciseId: row.exerciseId,
    exerciseName: row.exerciseName,
    orderIndex: row.orderIndex,
    groupId: row.groupId,
    orderWithinGroup: row.orderWithinGroup,
    supersetGroup: row.supersetGroup,
    supersetOrder: row.supersetOrder,
    setTypeLabel: row.setTypeLabel,
    isSubRow: row.isSubRow,
    parentRowId: row.parentRowId,
    notes: row.notes,
    restSeconds: row.restSeconds,
    prescriptionsByWeekId: row.prescriptionsByWeekId,
    subRows: row.subRows.map((subRow) => mapExerciseRow(subRow)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
