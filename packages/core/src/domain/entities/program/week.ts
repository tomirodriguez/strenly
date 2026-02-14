/**
 * Week validation for the Program aggregate.
 * A Week represents a training week containing sessions.
 */

import { err, ok, type Result } from 'neverthrow'
import { validateSession } from './session'
import type { ProgramError, Session, Week, WeekInput } from './types'

export function validateWeek(input: WeekInput, weekIndex: number): Result<Week, ProgramError> {
  // Default name: "Semana {orderIndex + 1}"
  const name = input.name?.trim() || `Semana ${input.orderIndex + 1}`

  // Validate name length
  if (name.length > 100) {
    return err({
      type: 'WEEK_NAME_TOO_LONG',
      message: 'Week name must not exceed 100 characters',
      weekIndex,
    })
  }

  // Validate orderIndex
  if (input.orderIndex < 0) {
    return err({
      type: 'WEEK_INVALID_ORDER_INDEX',
      message: 'Week order index cannot be negative',
      weekIndex,
    })
  }

  // Validate and collect sessions
  const sessionInputs = input.sessions ?? []
  const validatedSessions: Session[] = []
  const sessionOrderIndexes = new Set<number>()

  for (const sessionInput of sessionInputs) {
    // Check for duplicate orderIndexes
    if (sessionOrderIndexes.has(sessionInput.orderIndex)) {
      return err({
        type: 'SESSION_DUPLICATE_ORDER_INDEX',
        message: `Duplicate session orderIndex: ${sessionInput.orderIndex}`,
        weekIndex,
        orderIndex: sessionInput.orderIndex,
      })
    }
    sessionOrderIndexes.add(sessionInput.orderIndex)

    const sessionResult = validateSession(sessionInput, { weekIndex })
    if (sessionResult.isErr()) {
      return err(sessionResult.error)
    }
    validatedSessions.push(sessionResult.value)
  }

  return ok({
    id: input.id,
    name,
    orderIndex: input.orderIndex,
    sessions: validatedSessions,
  })
}

// ---- Standalone factory for creating a Week outside aggregate context ----

export type WeekValidationError =
  | { type: 'NAME_TOO_LONG'; message: string }
  | { type: 'INVALID_ORDER_INDEX'; message: string }

type CreateWeekInput = {
  id: string
  name?: string
  orderIndex: number
  sessions?: ReadonlyArray<Session>
}

export function createWeek(input: CreateWeekInput): Result<Week, WeekValidationError> {
  const name = input.name?.trim() || `Semana ${input.orderIndex + 1}`

  if (name.length > 50) {
    return err({ type: 'NAME_TOO_LONG', message: 'Week name must not exceed 50 characters' })
  }

  if (input.orderIndex < 0) {
    return err({ type: 'INVALID_ORDER_INDEX', message: 'Order index cannot be negative' })
  }

  return ok({
    id: input.id,
    name,
    orderIndex: input.orderIndex,
    sessions: input.sessions ?? [],
  })
}
