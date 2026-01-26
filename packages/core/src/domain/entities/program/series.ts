/**
 * Series validation for the Program aggregate.
 * A series represents a single set with reps, intensity, tempo, and rest.
 */

import { err, ok, type Result } from 'neverthrow'
import type { ProgramError, Series, SeriesInput } from './types'

// Tempo format: 4 characters, each is a digit (0-9) or X for explosive
const TEMPO_REGEX = /^[\dXx]{4}$/

type SeriesContext = {
  weekIndex: number
  sessionIndex: number
  groupIndex: number
  itemIndex: number
}

export function validateSeries(
  input: SeriesInput,
  orderIndex: number,
  ctx: SeriesContext,
): Result<Series, ProgramError> {
  const seriesIndex = orderIndex

  // Validate reps (>= 0 if provided)
  if (input.reps !== null && input.reps < 0) {
    return err({
      type: 'SERIES_REPS_INVALID',
      message: 'Reps cannot be negative',
      ...ctx,
      seriesIndex,
    })
  }

  // Validate AMRAP (reps must be null or 0 for AMRAP)
  if (input.isAmrap && input.reps !== null && input.reps > 0) {
    return err({
      type: 'SERIES_AMRAP_WITH_REPS',
      message: 'AMRAP series should have reps of null or 0',
      ...ctx,
      seriesIndex,
    })
  }

  // Validate rep range (max >= min)
  const repsMax = input.repsMax ?? null
  if (repsMax !== null && input.reps !== null && repsMax < input.reps) {
    return err({
      type: 'SERIES_REPS_RANGE_INVALID',
      message: 'Maximum reps must be greater than or equal to minimum reps',
      ...ctx,
      seriesIndex,
    })
  }

  // Validate intensity
  const intensityType = input.intensityType ?? null
  const intensityValue = input.intensityValue ?? null

  if (intensityType !== null && intensityValue === null) {
    return err({
      type: 'SERIES_INTENSITY_VALUE_REQUIRED',
      message: 'Intensity value is required when intensity type is specified',
      ...ctx,
      seriesIndex,
    })
  }

  if (intensityType !== null && intensityValue !== null) {
    switch (intensityType) {
      case 'percentage':
        if (intensityValue < 0 || intensityValue > 100) {
          return err({
            type: 'SERIES_PERCENTAGE_INVALID',
            message: 'Percentage must be between 0 and 100',
            ...ctx,
            seriesIndex,
          })
        }
        break
      case 'rpe':
        if (intensityValue < 0 || intensityValue > 10) {
          return err({
            type: 'SERIES_RPE_INVALID',
            message: 'RPE must be between 0 and 10',
            ...ctx,
            seriesIndex,
          })
        }
        break
      case 'rir':
        if (intensityValue < 0 || intensityValue > 10) {
          return err({
            type: 'SERIES_RIR_INVALID',
            message: 'RIR must be between 0 and 10',
            ...ctx,
            seriesIndex,
          })
        }
        break
      case 'absolute':
        if (intensityValue < 0) {
          return err({
            type: 'SERIES_ABSOLUTE_INVALID',
            message: 'Weight cannot be negative',
            ...ctx,
            seriesIndex,
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
        type: 'SERIES_TEMPO_INVALID',
        message: 'Tempo must be 4 characters (digits or X for explosive)',
        ...ctx,
        seriesIndex,
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
