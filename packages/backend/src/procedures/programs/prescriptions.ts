import { updatePrescriptionSchema } from '@strenly/contracts/programs'
import { formatSeriesToNotation, updatePrescriptionOutputSchema } from '@strenly/contracts/programs/prescription'
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

    // Return null if prescription was cleared, otherwise return formatted notation
    const series = result.value
    if (!series) {
      return null
    }

    // Convert Series[] to PrescriptionSeriesInput[] format for formatting
    const formattedNotation = formatSeriesToNotation(
      series.map((s) => ({
        orderIndex: s.orderIndex,
        reps: s.reps,
        repsMax: s.repsMax,
        isAmrap: s.isAmrap,
        intensityType: s.intensityType,
        intensityValue: s.intensityValue,
        intensityUnit: mapIntensityTypeToUnit(s.intensityType),
        tempo: s.tempo,
      })),
    )

    return {
      notation: formattedNotation,
    }
  })

/**
 * Map intensity type to intensity unit for formatting
 */
function mapIntensityTypeToUnit(
  intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null,
): 'kg' | 'lb' | '%' | 'rpe' | 'rir' | null {
  if (!intensityType) return null
  switch (intensityType) {
    case 'absolute':
      return 'kg' // Default to kg
    case 'percentage':
      return '%'
    case 'rpe':
      return 'rpe'
    case 'rir':
      return 'rir'
  }
}
