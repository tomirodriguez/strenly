import { err, ok, type Result } from 'neverthrow'
import { INTENSITY_TYPES, type IntensityType } from './prescription'

export type PrescriptionSeries = {
  readonly orderIndex: number
  readonly reps: number | null
  readonly repsMax: number | null
  readonly isAmrap: boolean
  readonly intensityType: IntensityType | null
  readonly intensityValue: number | null
  readonly tempo: string | null
  readonly restSeconds: number | null
}

export type PrescriptionSeriesError =
  | { type: 'ORDER_INDEX_INVALID'; message: string }
  | { type: 'REPS_INVALID'; message: string }
  | { type: 'REPS_RANGE_INVALID'; message: string }
  | { type: 'AMRAP_WITH_REPS'; message: string }
  | { type: 'PERCENTAGE_INVALID'; message: string }
  | { type: 'RPE_INVALID'; message: string }
  | { type: 'RIR_INVALID'; message: string }
  | { type: 'ABSOLUTE_INVALID'; message: string }
  | { type: 'INTENSITY_VALUE_REQUIRED'; message: string }
  | { type: 'TEMPO_INVALID'; message: string }

type CreatePrescriptionSeriesInput = {
  reps: number | null
  repsMax?: number | null
  isAmrap: boolean
  intensityType?: IntensityType | null
  intensityValue?: number | null
  tempo?: string | null
  restSeconds?: number | null
}

// Tempo format: 4 characters, each is a digit (0-9) or X for explosive
const TEMPO_REGEX = /^[\dXx]{4}$/

export function createPrescriptionSeries(
  input: CreatePrescriptionSeriesInput,
  orderIndex: number
): Result<PrescriptionSeries, PrescriptionSeriesError> {
  // Validate orderIndex
  if (orderIndex < 0) {
    return err({
      type: 'ORDER_INDEX_INVALID',
      message: 'Order index cannot be negative',
    })
  }

  // Validate reps (>= 0 if provided)
  if (input.reps !== null && input.reps < 0) {
    return err({
      type: 'REPS_INVALID',
      message: 'Reps cannot be negative',
    })
  }

  // Validate AMRAP (reps must be null or 0 for AMRAP)
  if (input.isAmrap && input.reps !== null && input.reps > 0) {
    return err({
      type: 'AMRAP_WITH_REPS',
      message: 'AMRAP series should have reps of null or 0',
    })
  }

  // Validate rep range (max >= min)
  const repsMax = input.repsMax ?? null
  if (repsMax !== null && input.reps !== null && repsMax < input.reps) {
    return err({
      type: 'REPS_RANGE_INVALID',
      message: 'Maximum reps must be greater than or equal to minimum reps',
    })
  }

  // Validate intensity
  const intensityType = input.intensityType ?? null
  const intensityValue = input.intensityValue ?? null

  if (intensityType !== null && intensityValue === null) {
    return err({
      type: 'INTENSITY_VALUE_REQUIRED',
      message: 'Intensity value is required when intensity type is specified',
    })
  }

  if (intensityType !== null && intensityValue !== null) {
    switch (intensityType) {
      case 'percentage':
        if (intensityValue < 0 || intensityValue > 100) {
          return err({
            type: 'PERCENTAGE_INVALID',
            message: 'Percentage must be between 0 and 100',
          })
        }
        break
      case 'rpe':
        if (intensityValue < 0 || intensityValue > 10) {
          return err({
            type: 'RPE_INVALID',
            message: 'RPE must be between 0 and 10',
          })
        }
        break
      case 'rir':
        if (intensityValue < 0 || intensityValue > 10) {
          return err({
            type: 'RIR_INVALID',
            message: 'RIR must be between 0 and 10',
          })
        }
        break
      case 'absolute':
        if (intensityValue < 0) {
          return err({
            type: 'ABSOLUTE_INVALID',
            message: 'Weight cannot be negative',
          })
        }
        break
    }
  }

  // Validate tempo
  let tempo = input.tempo ?? null
  if (tempo !== null) {
    if (!TEMPO_REGEX.test(tempo)) {
      return err({
        type: 'TEMPO_INVALID',
        message: 'Tempo must be 4 characters (digits or X for explosive)',
      })
    }
    // Normalize lowercase x to uppercase X
    tempo = tempo.toUpperCase()
  }

  return ok({
    orderIndex,
    reps: input.reps,
    repsMax,
    isAmrap: input.isAmrap,
    intensityType,
    intensityValue,
    tempo,
    restSeconds: input.restSeconds ?? null,
  })
}

/**
 * Reconstitute a PrescriptionSeries from database without validation.
 * Used when loading from the database where data is already known to be valid.
 */
export function reconstitutePrescriptionSeries(props: PrescriptionSeries): PrescriptionSeries {
  return { ...props }
}
