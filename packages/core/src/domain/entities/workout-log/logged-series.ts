/**
 * LoggedSeries validation
 *
 * Validates a single series within a logged exercise.
 * RPE must be between 1-10 if provided.
 */

import { err, ok, type Result } from 'neverthrow'
import type { LoggedSeries, LoggedSeriesInput, WorkoutLogError } from './types'

/**
 * Validates a LoggedSeriesInput and returns a LoggedSeries.
 *
 * @param input - The series input data
 * @param orderIndex - The series position (0-based)
 * @param exerciseIndex - The parent exercise index (for error context)
 * @param exerciseSkipped - Whether the parent exercise is skipped
 * @returns Result<LoggedSeries, WorkoutLogError>
 */
export function validateLoggedSeries(
  input: LoggedSeriesInput,
  orderIndex: number,
  exerciseIndex: number,
  exerciseSkipped: boolean,
): Result<LoggedSeries, WorkoutLogError> {
  // Validate RPE if provided (must be 1-10)
  if (input.rpe !== undefined && input.rpe !== null) {
    if (input.rpe < 1 || input.rpe > 10) {
      return err({
        type: 'INVALID_RPE',
        message: `RPE must be between 1 and 10, got ${input.rpe}`,
        exerciseIndex,
        seriesIndex: orderIndex,
      })
    }
  }

  // Validate weightUsed (>= 0 if provided)
  if (input.weightUsed !== undefined && input.weightUsed !== null && input.weightUsed < 0) {
    return err({
      type: 'INVALID_WEIGHT',
      message: `Weight used cannot be negative, got ${input.weightUsed}`,
      exerciseIndex,
      seriesIndex: orderIndex,
    })
  }

  // Validate repsPerformed (>= 0 if provided)
  if (input.repsPerformed !== undefined && input.repsPerformed !== null && input.repsPerformed < 0) {
    return err({
      type: 'INVALID_REPS',
      message: `Reps performed cannot be negative, got ${input.repsPerformed}`,
      exerciseIndex,
      seriesIndex: orderIndex,
    })
  }

  // If exercise is skipped, mark all series as skipped
  const skipped = exerciseSkipped || (input.skipped ?? false)

  return ok({
    orderIndex,
    repsPerformed: input.repsPerformed ?? null,
    weightUsed: input.weightUsed ?? null,
    rpe: input.rpe ?? null,
    skipped,
    prescribedReps: input.prescribedReps ?? null,
    prescribedWeight: input.prescribedWeight ?? null,
    // Extended prescription snapshot
    prescribedRepsMax: input.prescribedRepsMax ?? null,
    prescribedIsAmrap: input.prescribedIsAmrap ?? false,
    prescribedIntensityType: input.prescribedIntensityType ?? null,
    prescribedIntensityValue: input.prescribedIntensityValue ?? null,
    prescribedTempo: input.prescribedTempo ?? null,
    prescribedRestSeconds: input.prescribedRestSeconds ?? null,
  })
}
