/**
 * LoggedExercise validation
 *
 * Validates a logged exercise within a workout log.
 * Collects and validates all series.
 */

import { err, ok, type Result } from 'neverthrow'
import { validateLoggedSeries } from './logged-series'
import type { LoggedExercise, LoggedExerciseInput, LoggedSeries, WorkoutLogError } from './types'

/**
 * Validates a LoggedExerciseInput and returns a LoggedExercise.
 *
 * @param input - The exercise input data
 * @param exerciseIndex - The exercise position (0-based, for error context)
 * @returns Result<LoggedExercise, WorkoutLogError>
 */
export function validateLoggedExercise(input: LoggedExerciseInput, exerciseIndex: number): Result<LoggedExercise, WorkoutLogError> {
  // Validate exerciseId required
  if (!input.exerciseId || input.exerciseId.trim() === '') {
    return err({
      type: 'EXERCISE_ID_REQUIRED',
      message: 'Exercise ID is required',
      exerciseIndex,
    })
  }

  // Validate groupItemId required
  if (!input.groupItemId || input.groupItemId.trim() === '') {
    return err({
      type: 'GROUP_ITEM_ID_REQUIRED',
      message: 'Group item ID is required',
      exerciseIndex,
    })
  }

  // Validate orderIndex is non-negative
  if (input.orderIndex < 0) {
    return err({
      type: 'INVALID_ORDER_INDEX',
      message: `Order index must be non-negative, got ${input.orderIndex}`,
      exerciseIndex,
    })
  }

  // Determine if exercise is skipped
  const exerciseSkipped = input.skipped ?? false

  // Validate series
  const seriesInputs = input.series ?? []
  const validatedSeries: LoggedSeries[] = []

  for (const [seriesIndex, seriesInput] of seriesInputs.entries()) {
    const seriesResult = validateLoggedSeries(seriesInput, seriesIndex, exerciseIndex, exerciseSkipped)
    if (seriesResult.isErr()) {
      return err(seriesResult.error)
    }
    validatedSeries.push(seriesResult.value)
  }

  return ok({
    id: input.id,
    exerciseId: input.exerciseId.trim(),
    groupItemId: input.groupItemId.trim(),
    orderIndex: input.orderIndex,
    notes: input.notes ?? null,
    skipped: exerciseSkipped,
    series: validatedSeries,
  })
}
