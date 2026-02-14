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
import type { CreateProgramInput, Program, ProgramError, ProgramStatus, Week, WeekInput } from './types'
import { validateWeek } from './week'

export type { Program, ProgramError } from './types'

// Valid status transitions: draft -> active, active -> archived, draft -> archived
const VALID_STATUS_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
  draft: ['active', 'archived'],
  active: ['archived'],
  archived: [],
}

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

/**
 * Activate a program (draft -> active).
 */
export function activateProgram(program: Program): Result<Program, ProgramError> {
  return transitionStatus(program, 'active')
}

/**
 * Archive a program (draft -> archived or active -> archived).
 */
export function archiveProgram(program: Program): Result<Program, ProgramError> {
  return transitionStatus(program, 'archived')
}

/**
 * Transition a program to a new status with validation.
 */
function transitionStatus(program: Program, newStatus: ProgramStatus): Result<Program, ProgramError> {
  if (!VALID_STATUS_TRANSITIONS[program.status].includes(newStatus)) {
    return err({
      type: 'INVALID_STATUS_TRANSITION',
      message: `Cannot transition from ${program.status} to ${newStatus}`,
      from: program.status,
      to: newStatus,
    })
  }

  return ok({
    ...program,
    status: newStatus,
    updatedAt: new Date(),
  })
}

/**
 * Add a week to the program. Validates the new week and checks for duplicate orderIndexes.
 */
export function addWeek(program: Program, input: WeekInput): Result<Program, ProgramError> {
  // Check for duplicate orderIndex
  const existingOrderIndexes = new Set(program.weeks.map((w) => w.orderIndex))
  if (existingOrderIndexes.has(input.orderIndex)) {
    return err({
      type: 'WEEK_DUPLICATE_ORDER_INDEX',
      message: `Duplicate week orderIndex: ${input.orderIndex}`,
      orderIndex: input.orderIndex,
    })
  }

  // Validate the new week
  const weekResult = validateWeek(input, program.weeks.length)
  if (weekResult.isErr()) {
    return err(weekResult.error)
  }

  return ok({
    ...program,
    weeks: [...program.weeks, weekResult.value],
    updatedAt: new Date(),
  })
}

/**
 * Remove a week from the program by ID.
 */
export function removeWeek(program: Program, weekId: string): Result<Program, ProgramError> {
  const weekExists = program.weeks.some((w) => w.id === weekId)
  if (!weekExists) {
    return err({
      type: 'WEEK_NOT_FOUND',
      message: `Week not found: ${weekId}`,
      weekId,
    })
  }

  return ok({
    ...program,
    weeks: program.weeks.filter((w) => w.id !== weekId),
    updatedAt: new Date(),
  })
}
