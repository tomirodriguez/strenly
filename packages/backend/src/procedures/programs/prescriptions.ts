import { updatePrescriptionSchema } from '@strenly/contracts/programs'
import { updatePrescriptionOutputSchema } from '@strenly/contracts/programs/prescription'
import { createProgramRepository } from '../../infrastructure/repositories/program.repository'
import { authProcedure } from '../../lib/orpc'
import { makeUpdatePrescription } from '../../use-cases/programs/update-prescription'

/**
 * Update a prescription cell in the program grid
 * This is the core operation for grid editing - called on every cell edit
 *
 * Parses notation like "3x8@120kg" into structured data
 * Pass "-" or empty string to clear the cell
 *
 * @deprecated Use aggregate save via programs.prescriptions.saveDraft instead
 */
export const updatePrescriptionProcedure = authProcedure
  .errors({
    FORBIDDEN: { message: 'No tienes permisos para modificar programas' },
    EXERCISE_ROW_NOT_FOUND: { message: 'Fila de ejercicio no encontrada' },
    WEEK_NOT_FOUND: { message: 'Semana no encontrada' },
    VALIDATION_ERROR: { message: 'Notacion de prescripcion invalida' },
  })
  .input(updatePrescriptionSchema)
  .output(updatePrescriptionOutputSchema.nullable())
  .handler(async ({ input, context, errors }) => {
    const useCase = makeUpdatePrescription({
      programRepository: createProgramRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      exerciseRowId: input.exerciseRowId,
      weekId: input.weekId,
      notation: input.notation,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'not_found':
          if (result.error.entityType === 'exercise_row') {
            throw errors.EXERCISE_ROW_NOT_FOUND()
          }
          throw errors.WEEK_NOT_FOUND()
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    // Use case returns formatted notation or null (cleared)
    const notation = result.value
    return notation !== null ? { notation } : null
  })
