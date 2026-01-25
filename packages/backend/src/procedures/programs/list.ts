import { listProgramsInputSchema, listProgramsOutputSchema } from '@strenly/contracts/programs'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeListPrograms } from '../../use-cases/programs/list-programs'

/**
 * List programs with optional filters
 * Requires authentication and programs:read permission
 */
export const listPrograms = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to list programs' },
  })
  .input(listProgramsInputSchema)
  .output(listProgramsOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const listProgramsUseCase = makeListPrograms({
      programRepository: createProgramRepository(context.db),
    })

    const result = await listProgramsUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      athleteId: input.athleteId,
      isTemplate: input.isTemplate,
      status: input.status,
      search: input.search,
      limit: input.limit,
      offset: input.offset,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const { items, totalCount } = result.value

    return {
      items: items.map((program) => ({
        id: program.id,
        organizationId: program.organizationId,
        name: program.name,
        description: program.description,
        athleteId: program.athleteId,
        isTemplate: program.isTemplate,
        status: program.status,
        createdAt: program.createdAt.toISOString(),
        updatedAt: program.updatedAt.toISOString(),
      })),
      totalCount,
    }
  })
