/**
 * Session validation for the Program aggregate.
 * A Session represents a training session within a week.
 */

import { err, ok, type Result } from 'neverthrow'
import { validateExerciseGroup } from './exercise-group'
import type { ExerciseGroup, ProgramError, Session, SessionInput } from './types'

type SessionContext = {
  weekIndex: number
}

export function validateSession(
  input: SessionInput,
  ctx: SessionContext,
): Result<Session, ProgramError> {
  const sessionIndex = input.orderIndex

  // Validate name
  const trimmedName = input.name.trim()
  if (!trimmedName) {
    return err({
      type: 'SESSION_NAME_REQUIRED',
      message: 'Session name is required',
      ...ctx,
      sessionIndex,
    })
  }

  if (trimmedName.length > 100) {
    return err({
      type: 'SESSION_NAME_TOO_LONG',
      message: 'Session name must not exceed 100 characters',
      ...ctx,
      sessionIndex,
    })
  }

  // Validate orderIndex
  if (input.orderIndex < 0) {
    return err({
      type: 'SESSION_INVALID_ORDER_INDEX',
      message: 'Session order index cannot be negative',
      ...ctx,
      sessionIndex,
    })
  }

  // Validate and collect exerciseGroups
  const groupInputs = input.exerciseGroups ?? []
  const validatedGroups: ExerciseGroup[] = []
  const groupOrderIndexes = new Set<number>()

  for (const groupInput of groupInputs) {
    // Check for duplicate orderIndexes
    if (groupOrderIndexes.has(groupInput.orderIndex)) {
      return err({
        type: 'GROUP_DUPLICATE_ORDER_INDEX',
        message: `Duplicate group orderIndex: ${groupInput.orderIndex}`,
        ...ctx,
        sessionIndex,
        orderIndex: groupInput.orderIndex,
      })
    }
    groupOrderIndexes.add(groupInput.orderIndex)

    const groupResult = validateExerciseGroup(groupInput, {
      ...ctx,
      sessionIndex,
    })
    if (groupResult.isErr()) {
      return err(groupResult.error)
    }
    validatedGroups.push(groupResult.value)
  }

  return ok({
    id: input.id,
    name: trimmedName,
    orderIndex: input.orderIndex,
    exerciseGroups: validatedGroups,
  })
}
