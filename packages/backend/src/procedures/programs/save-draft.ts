import { saveDraftInputSchema, saveDraftOutputSchema } from '@strenly/contracts/programs/save-draft'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeSaveDraft } from '../../use-cases/programs/save-draft'

/**
 * Save draft changes to a program using the aggregate pattern.
 *
 * Accepts the complete program state from the frontend and persists it atomically.
 * Validation happens via the createProgram() domain factory in the use case.
 */
export const saveDraftProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    PROGRAM_NOT_FOUND: { message: 'Programa no encontrado' },
    VALIDATION_ERROR: { message: 'Error de validacion' },
    CONFLICT: { message: 'El programa fue modificado por otro usuario' },
  })
  .input(saveDraftInputSchema)
  .output(saveDraftOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeSaveDraft({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase(
      {
        organizationId: context.organization.id,
        userId: context.user.id,
        memberRole: context.membership.role,
      },
      {
        programId: input.programId,
        program: input.program,
        lastLoadedAt: input.lastLoadedAt,
      },
    )

    if (result.isErr()) {
      switch (result.error.type) {
        case 'unauthorized':
          throw errors.FORBIDDEN()
        case 'program_not_found':
          throw errors.PROGRAM_NOT_FOUND()
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'conflict':
          throw errors.CONFLICT({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error in saveDraft:', result.error.message)
          throw new Error('Internal error')
      }
    }

    return {
      success: true,
      updatedAt: result.value.updatedAt,
      conflictWarning: result.value.conflictWarning,
    }
  })
