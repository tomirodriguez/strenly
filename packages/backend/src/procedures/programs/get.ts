import { getProgramInputSchema, programAggregateSchema } from '@strenly/contracts/programs'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeGetProgram } from '../../use-cases/programs/get-program'

/**
 * Get a program with full aggregate hierarchy.
 *
 * Returns the complete program aggregate with:
 * weeks -> sessions -> exerciseGroups -> items -> series
 *
 * Requires authentication and programs:read permission.
 */
export const getProgram = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to view programs' },
    NOT_FOUND: { message: 'Program not found' },
  })
  .input(getProgramInputSchema)
  .output(programAggregateSchema)
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

    // Map domain Program to contract ProgramAggregate
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
        name: week.name,
        orderIndex: week.orderIndex,
        sessions: week.sessions.map((session) => ({
          id: session.id,
          name: session.name,
          orderIndex: session.orderIndex,
          exerciseGroups: session.exerciseGroups.map((group) => ({
            id: group.id,
            orderIndex: group.orderIndex,
            items: group.items.map((item) => ({
              id: item.id,
              exerciseId: item.exerciseId,
              orderIndex: item.orderIndex,
              series: item.series.map((s) => ({
                orderIndex: s.orderIndex,
                reps: s.reps,
                repsMax: s.repsMax,
                isAmrap: s.isAmrap,
                intensityType: s.intensityType,
                intensityValue: s.intensityValue,
                tempo: s.tempo,
                restSeconds: s.restSeconds,
              })),
            })),
          })),
        })),
      })),
    }
  })
