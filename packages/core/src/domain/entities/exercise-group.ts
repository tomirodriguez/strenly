import { err, ok, type Result } from 'neverthrow'

export type ExerciseGroup = {
  readonly id: string
  readonly sessionId: string
  readonly orderIndex: number
  readonly name: string | null
}

export type ExerciseGroupError =
  | { type: 'ID_REQUIRED'; message: string }
  | { type: 'SESSION_ID_REQUIRED'; message: string }
  | { type: 'ORDER_INDEX_INVALID'; message: string }

type CreateExerciseGroupInput = {
  id: string
  sessionId: string
  orderIndex: number
  name?: string | null
}

export function createExerciseGroup(
  input: CreateExerciseGroupInput
): Result<ExerciseGroup, ExerciseGroupError> {
  // Validate id
  const trimmedId = input.id.trim()
  if (!trimmedId) {
    return err({
      type: 'ID_REQUIRED',
      message: 'Exercise group ID is required',
    })
  }

  // Validate sessionId
  const trimmedSessionId = input.sessionId.trim()
  if (!trimmedSessionId) {
    return err({
      type: 'SESSION_ID_REQUIRED',
      message: 'Session ID is required',
    })
  }

  // Validate orderIndex
  if (input.orderIndex < 0) {
    return err({
      type: 'ORDER_INDEX_INVALID',
      message: 'Order index cannot be negative',
    })
  }

  // Normalize name: empty/whitespace -> null, otherwise trim
  let normalizedName: string | null = null
  if (input.name !== undefined && input.name !== null) {
    const trimmedName = input.name.trim()
    normalizedName = trimmedName || null
  }

  return ok({
    id: trimmedId,
    sessionId: trimmedSessionId,
    orderIndex: input.orderIndex,
    name: normalizedName,
  })
}

/**
 * Reconstitute an ExerciseGroup from database without validation.
 * Used when loading from the database where data is already known to be valid.
 */
export function reconstituteExerciseGroup(props: ExerciseGroup): ExerciseGroup {
  return { ...props }
}
