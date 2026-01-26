/**
 * ExerciseGroup validation for the Program aggregate.
 * An ExerciseGroup contains one or more items (exercises) that can be supersetted.
 * The group letter (A, B, C...) is derived from orderIndex in the UI.
 */

import { err, ok, type Result } from 'neverthrow'
import { validateGroupItem } from './group-item'
import type { ExerciseGroup, ExerciseGroupInput, GroupItem, ProgramError } from './types'

type ExerciseGroupContext = {
  weekIndex: number
  sessionIndex: number
}

export function validateExerciseGroup(
  input: ExerciseGroupInput,
  ctx: ExerciseGroupContext,
): Result<ExerciseGroup, ProgramError> {
  const groupIndex = input.orderIndex

  // Validate orderIndex
  if (input.orderIndex < 0) {
    return err({
      type: 'GROUP_INVALID_ORDER_INDEX',
      message: 'Group order index cannot be negative',
      ...ctx,
      groupIndex,
    })
  }

  // Validate at least one item
  if (input.items.length === 0) {
    return err({
      type: 'GROUP_EMPTY',
      message: 'Exercise group must have at least one exercise',
      ...ctx,
      groupIndex,
    })
  }

  // Validate and collect items
  const validatedItems: GroupItem[] = []
  const itemOrderIndexes = new Set<number>()

  for (const itemInput of input.items) {
    // Check for duplicate orderIndexes
    if (itemOrderIndexes.has(itemInput.orderIndex)) {
      return err({
        type: 'ITEM_DUPLICATE_ORDER_INDEX',
        message: `Duplicate item orderIndex: ${itemInput.orderIndex}`,
        ...ctx,
        groupIndex,
        orderIndex: itemInput.orderIndex,
      })
    }
    itemOrderIndexes.add(itemInput.orderIndex)

    const itemResult = validateGroupItem(itemInput, {
      ...ctx,
      groupIndex,
    })
    if (itemResult.isErr()) {
      return err(itemResult.error)
    }
    validatedItems.push(itemResult.value)
  }

  return ok({
    id: input.id,
    orderIndex: input.orderIndex,
    items: validatedItems,
  })
}
