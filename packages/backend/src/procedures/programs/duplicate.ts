import { duplicateProgramInputSchema, programAggregateSchema } from '@strenly/contracts/programs'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeDuplicateProgram } from '../../use-cases/programs/duplicate-program'
import { mapProgramToAggregate } from './map-program-to-aggregate'

/**
 * Duplicate a program (deep copy with new IDs)
 *
 * Returns the complete program aggregate with:
 * weeks -> sessions -> exerciseGroups -> items -> series
 *
 * Requires authentication and programs:write permission.
 */
export const duplicateProgram = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create programs' },
    NOT_FOUND: { message: 'Source program not found' },
    VALIDATION_ERROR: { message: 'Invalid program data' },
  })
  .input(duplicateProgramInputSchema)
  .output(programAggregateSchema)
  .handler(async ({ input, context, errors }) => {
    const duplicateProgramUseCase = makeDuplicateProgram({
      programRepository: createProgramRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await duplicateProgramUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      sourceProgramId: input.sourceProgramId,
      name: input.name,
      athleteId: input.athleteId ?? null,
      isTemplate: input.isTemplate,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'not_found':
          throw errors.NOT_FOUND({ message: `Program ${result.error.programId} not found` })
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const program = result.value

    // Map domain Program to contract ProgramAggregate
    return mapProgramToAggregate(program)
  })
