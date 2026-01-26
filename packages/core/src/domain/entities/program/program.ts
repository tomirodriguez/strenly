/**
 * Program Aggregate Root
 *
 * The Program is the aggregate root for the training program hierarchy:
 * Program -> Weeks -> Sessions -> ExerciseGroups -> GroupItems -> Series
 *
 * All validation happens through createProgram(), which validates the entire
 * hierarchy before returning ok(). The reconstituteProgram() function is used
 * for database loads where data is already known to be valid.
 */

import { err, ok, type Result } from 'neverthrow'
import type { CreateProgramInput, Program, ProgramError, Week } from './types'
import { validateWeek } from './week'

export { type Program, type ProgramError } from './types'

/**
 * Create a new Program with full hierarchy validation.
 *
 * @param input - The program input data including nested weeks/sessions/groups/items/series
 * @returns Result<Program, ProgramError> - ok(Program) if valid, err(ProgramError) with context otherwise
 */
export function createProgram(input: CreateProgramInput): Result<Program, ProgramError> {
  // Validate name
  const trimmedName = input.name.trim()

  if (trimmedName.length === 0) {
    return err({ type: 'NAME_REQUIRED', message: 'Program name is required' })
  }

  if (trimmedName.length < 3) {
    return err({
      type: 'NAME_TOO_SHORT',
      message: 'Program name must be at least 3 characters',
    })
  }

  if (trimmedName.length > 100) {
    return err({
      type: 'NAME_TOO_LONG',
      message: 'Program name must not exceed 100 characters',
    })
  }

  // Validate weeks
  const weekInputs = input.weeks ?? []
  const validatedWeeks: Week[] = []
  const weekOrderIndexes = new Set<number>()

  for (const [i, weekInput] of weekInputs.entries()) {
    // Check for duplicate orderIndexes
    if (weekOrderIndexes.has(weekInput.orderIndex)) {
      return err({
        type: 'WEEK_DUPLICATE_ORDER_INDEX',
        message: `Duplicate week orderIndex: ${weekInput.orderIndex}`,
        orderIndex: weekInput.orderIndex,
      })
    }
    weekOrderIndexes.add(weekInput.orderIndex)

    const weekResult = validateWeek(weekInput, i)
    if (weekResult.isErr()) {
      return err(weekResult.error)
    }
    validatedWeeks.push(weekResult.value)
  }

  const now = new Date()

  return ok({
    id: input.id,
    organizationId: input.organizationId,
    name: trimmedName,
    description: input.description ?? null,
    athleteId: input.athleteId ?? null,
    isTemplate: input.isTemplate ?? false,
    status: input.status ?? 'draft',
    weeks: validatedWeeks,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  })
}

/**
 * Reconstitute a Program from database props without validation.
 * Used when loading from the database where data is already known to be valid.
 *
 * @param props - The complete program properties from the database
 * @returns Program - The reconstituted program
 */
export function reconstituteProgram(props: Program): Program {
  return { ...props }
}
