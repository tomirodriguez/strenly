/**
 * GroupItem validation for the Program aggregate.
 * A GroupItem represents an exercise within an ExerciseGroup, with its series.
 */

import { err, ok, type Result } from 'neverthrow'
import { validateSeries } from './series'
import type { GroupItem, GroupItemInput, ProgramError, Series } from './types'

type GroupItemContext = {
  weekIndex: number
  sessionIndex: number
  groupIndex: number
}

export function validateGroupItem(input: GroupItemInput, ctx: GroupItemContext): Result<GroupItem, ProgramError> {
  const itemIndex = input.orderIndex

  // Validate exerciseId
  const trimmedExerciseId = input.exerciseId.trim()
  if (!trimmedExerciseId) {
    return err({
      type: 'ITEM_EXERCISE_ID_REQUIRED',
      message: 'Exercise ID is required',
      ...ctx,
      itemIndex,
    })
  }

  // Validate orderIndex
  if (input.orderIndex < 0) {
    return err({
      type: 'ITEM_INVALID_ORDER_INDEX',
      message: 'Item order index cannot be negative',
      ...ctx,
      itemIndex,
    })
  }

  // Validate and collect series
  const seriesInputs = input.series ?? []
  const validatedSeries: Series[] = []

  for (const [i, seriesInput] of seriesInputs.entries()) {
    const seriesResult = validateSeries(seriesInput, i, {
      ...ctx,
      itemIndex,
    })
    if (seriesResult.isErr()) {
      return err(seriesResult.error)
    }
    validatedSeries.push(seriesResult.value)
  }

  return ok({
    id: input.id,
    exerciseId: trimmedExerciseId,
    orderIndex: input.orderIndex,
    series: validatedSeries,
  })
}
