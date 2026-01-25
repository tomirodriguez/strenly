import { saveDraftInputSchema, saveDraftOutputSchema } from '@strenly/contracts/programs/save-draft'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeSaveDraft } from '../../use-cases/programs/save-draft'

/**
 * Save draft changes to a program atomically.
 * This is the bulk save operation for client-side editing.
 *
 * Accepts all changes made client-side (prescriptions, exercise rows, groups)
 * and persists them in a single transaction.
 *
 * This coexists with existing per-change mutations (updatePrescription, updateExerciseRow)
 * during the transition period.
 */
export const saveDraftProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    PROGRAM_NOT_FOUND: { message: 'Programa no encontrado' },
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
      input,
    )

    if (result.isErr()) {
      switch (result.error.type) {
        case 'unauthorized':
          throw errors.FORBIDDEN()
        case 'program_not_found':
          throw errors.PROGRAM_NOT_FOUND()
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
