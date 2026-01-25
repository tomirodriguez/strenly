import { err, ok, type Result } from 'neverthrow'

export const INTENSITY_TYPES = ['absolute', 'percentage', 'rpe', 'rir'] as const
export type IntensityType = (typeof INTENSITY_TYPES)[number]

export const UNILATERAL_UNITS = ['leg', 'arm', 'side'] as const
export type UnilateralUnit = (typeof UNILATERAL_UNITS)[number]

export type Prescription = {
  readonly id: string
  readonly sets: number
  readonly repsMin: number
  readonly repsMax: number | null
  readonly isAmrap: boolean
  readonly isUnilateral: boolean
  readonly unilateralUnit: UnilateralUnit | null
  readonly intensityType: IntensityType | null
  readonly intensityValue: number | null
  readonly tempo: string | null
  readonly restSeconds: number | null
  readonly notes: string | null
}

export type PrescriptionError =
  | { type: 'SETS_INVALID'; message: string }
  | { type: 'REPS_INVALID'; message: string }
  | { type: 'REPS_RANGE_INVALID'; message: string }
  | { type: 'AMRAP_WITH_REPS'; message: string }
  | { type: 'PERCENTAGE_INVALID'; message: string }
  | { type: 'RPE_INVALID'; message: string }
  | { type: 'RIR_INVALID'; message: string }
  | { type: 'ABSOLUTE_INVALID'; message: string }
  | { type: 'INTENSITY_VALUE_REQUIRED'; message: string }
  | { type: 'TEMPO_INVALID'; message: string }

type CreatePrescriptionInput = {
  id: string
  sets: number
  repsMin: number
  repsMax?: number | null
  isAmrap?: boolean
  isUnilateral?: boolean
  unilateralUnit?: UnilateralUnit | null
  intensityType?: IntensityType | null
  intensityValue?: number | null
  tempo?: string | null
  restSeconds?: number | null
  notes?: string | null
}

// Tempo format: 4 characters, each is a digit (0-9) or X for explosive
const TEMPO_REGEX = /^[\dXx]{4}$/

export function createPrescription(input: CreatePrescriptionInput): Result<Prescription, PrescriptionError> {
  // Validate sets (1-20)
  if (input.sets < 1 || input.sets > 20) {
    return err({
      type: 'SETS_INVALID',
      message: 'Sets must be between 1 and 20',
    })
  }

  // Validate repsMin (>= 0)
  if (input.repsMin < 0) {
    return err({
      type: 'REPS_INVALID',
      message: 'Reps cannot be negative',
    })
  }

  const isAmrap = input.isAmrap ?? false

  // Validate AMRAP (repsMin must be 0 for AMRAP)
  if (isAmrap && input.repsMin > 0) {
    return err({
      type: 'AMRAP_WITH_REPS',
      message: 'AMRAP sets should have repsMin of 0',
    })
  }

  // Validate rep range (max >= min)
  const repsMax = input.repsMax ?? null
  if (repsMax !== null && repsMax < input.repsMin) {
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
    id: input.id,
    sets: input.sets,
    repsMin: input.repsMin,
    repsMax,
    isAmrap,
    isUnilateral: input.isUnilateral ?? false,
    unilateralUnit: input.unilateralUnit ?? null,
    intensityType,
    intensityValue,
    tempo,
    restSeconds: input.restSeconds ?? null,
    notes: input.notes ?? null,
  })
}
