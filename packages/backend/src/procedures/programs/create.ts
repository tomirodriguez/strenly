import { createProgramInputSchema, programSchema } from '@strenly/contracts/programs'
import { createAthleteRepository } from '../../infrastructure/repositories/athlete.repository'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeCreateProgram } from '../../use-cases/programs/create-program'

/**
 * Create a new program
 * Requires authentication and programs:write permission
 */
export const createProgram = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create programs' },
    VALIDATION_ERROR: { message: 'Invalid program data' },
    ATHLETE_NOT_FOUND: { message: 'Athlete not found' },
  })
  .input(createProgramInputSchema)
  .output(programSchema)
  .handler(async ({ input, context, errors }) => {
    const createProgramUseCase = makeCreateProgram({
      programRepository: createProgramRepository(context.db),
      athleteRepository: createAthleteRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await createProgramUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      name: input.name,
      description: input.description || null,
      athleteId: input.athleteId ?? null,
      isTemplate: input.isTemplate,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'athlete_not_found':
          throw errors.ATHLETE_NOT_FOUND({ message: `Athlete ${result.error.athleteId} not found` })
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
    }
  })
