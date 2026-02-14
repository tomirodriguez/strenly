import {
  createFromTemplateInputSchema,
  listTemplatesInputSchema,
  listTemplatesOutputSchema,
  programAggregateSchema,
  saveAsTemplateInputSchema,
} from '@strenly/contracts/programs'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeCreateFromTemplate } from '../../use-cases/programs/create-from-template'
import { makeListPrograms } from '../../use-cases/programs/list-programs'
import { makeSaveAsTemplate } from '../../use-cases/programs/save-as-template'
import { mapProgramToAggregate } from './map-program-to-aggregate'
import { mapProgramToOutput } from './map-program-to-output'

/**
 * Save a program as a template.
 *
 * Returns the complete program aggregate with:
 * weeks -> sessions -> exerciseGroups -> items -> series
 *
 * Requires authentication and programs:write permission.
 */
export const saveAsTemplateProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create templates' },
    NOT_FOUND: { message: 'Program not found' },
    VALIDATION_ERROR: { message: 'Invalid template data' },
  })
  .input(saveAsTemplateInputSchema)
  .output(programAggregateSchema)
  .handler(async ({ input, context, errors }) => {
    const saveAsTemplateUseCase = makeSaveAsTemplate({
      programRepository: createProgramRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await saveAsTemplateUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      programId: input.programId,
      name: input.name,
      description: input.description ?? null,
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

/**
 * Create a new program from a template.
 *
 * Returns the complete program aggregate with:
 * weeks -> sessions -> exerciseGroups -> items -> series
 *
 * Requires authentication and programs:write permission.
 */
export const createFromTemplateProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create programs' },
    NOT_FOUND: { message: 'Template not found' },
    NOT_A_TEMPLATE: { message: 'Source is not a template' },
    VALIDATION_ERROR: { message: 'Invalid program data' },
  })
  .input(createFromTemplateInputSchema)
  .output(programAggregateSchema)
  .handler(async ({ input, context, errors }) => {
    const createFromTemplateUseCase = makeCreateFromTemplate({
      programRepository: createProgramRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await createFromTemplateUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      templateId: input.templateId,
      name: input.name,
      athleteId: input.athleteId ?? null,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'not_found':
          throw errors.NOT_FOUND({ message: `Template ${result.error.templateId} not found` })
        case 'not_a_template':
          throw errors.NOT_A_TEMPLATE({
            message: `Program ${result.error.templateId} is not a template`,
          })
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

/**
 * List all templates in the organization.
 *
 * Returns basic template info (not full aggregate).
 *
 * Requires authentication and programs:read permission.
 */
export const listTemplatesProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to list templates' },
  })
  .input(listTemplatesInputSchema)
  .output(listTemplatesOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const listProgramsUseCase = makeListPrograms({
      programRepository: createProgramRepository(context.db),
    })

    const result = await listProgramsUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      isTemplate: true, // Only templates
      status: 'active', // Only active templates
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
      items: items.map(mapProgramToOutput),
      totalCount,
    }
  })
