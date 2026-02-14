import { successOutputSchema } from '@strenly/contracts/common/success'
import {
  addSessionSchema,
  deleteSessionSchema,
  sessionOutputSchema,
  updateSessionSchema,
} from '@strenly/contracts/programs'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeAddSession } from '../../use-cases/programs/add-session'
import { makeDeleteSession } from '../../use-cases/programs/delete-session'
import { makeUpdateSession } from '../../use-cases/programs/update-session'

/**
 * Add a new session (training day) to a program
 */
export const addSessionProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'You do not have permission to modify programs' },
    PROGRAM_NOT_FOUND: { message: 'Program not found' },
    VALIDATION_ERROR: { message: 'Invalid session data' },
  })
  .input(addSessionSchema)
  .output(sessionOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeAddSession({
      programRepository: createProgramRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      programId: input.programId,
      name: input.name,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'program_not_found':
          throw errors.PROGRAM_NOT_FOUND()
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const session = result.value

    return {
      id: session.id,
      programId: session.programId,
      name: session.name,
      orderIndex: session.orderIndex,
    }
  })

/**
 * Update a session's name
 */
export const updateSessionProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'You do not have permission to modify programs' },
    NOT_FOUND: { message: 'Session not found' },
    VALIDATION_ERROR: { message: 'Invalid session data' },
  })
  .input(updateSessionSchema)
  .output(sessionOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeUpdateSession({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      sessionId: input.sessionId,
      name: input.name,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const session = result.value

    return {
      id: session.id,
      programId: session.programId,
      name: session.name,
      orderIndex: session.orderIndex,
    }
  })

/**
 * Delete a session from a program
 */
export const deleteSessionProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'You do not have permission to modify programs' },
    NOT_FOUND: { message: 'Session not found' },
    PROGRAM_NOT_FOUND: { message: 'Program not found' },
    LAST_SESSION: { message: 'Cannot delete the last session of a program' },
  })
  .input(deleteSessionSchema)
  .output(successOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeDeleteSession({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      programId: input.programId,
      sessionId: input.sessionId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          throw errors.NOT_FOUND()
        case 'program_not_found':
          throw errors.PROGRAM_NOT_FOUND()
        case 'last_session':
          throw errors.LAST_SESSION()
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return { success: true }
  })
