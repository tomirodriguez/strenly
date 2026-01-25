import { err, ok, type Result } from 'neverthrow'

export const PROGRAM_STATUSES = ['draft', 'active', 'archived'] as const
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number]

export function isProgramStatus(value: unknown): value is ProgramStatus {
  return (
    typeof value === 'string' && PROGRAM_STATUSES.includes(value as ProgramStatus)
  )
}

export type Program = {
  readonly id: string
  readonly organizationId: string
  readonly name: string
  readonly description: string | null
  readonly athleteId: string | null
  readonly isTemplate: boolean
  readonly status: ProgramStatus
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type ProgramError =
  | { type: 'NAME_REQUIRED'; message: string }
  | { type: 'NAME_TOO_SHORT'; message: string }
  | { type: 'NAME_TOO_LONG'; message: string }
  | { type: 'INVALID_STATUS_TRANSITION'; message: string }

type CreateProgramInput = {
  id: string
  organizationId: string
  name: string
  description?: string | null
  athleteId?: string | null
  isTemplate?: boolean
  status?: ProgramStatus
  createdAt?: Date
  updatedAt?: Date
}

export function createProgram(
  input: CreateProgramInput
): Result<Program, ProgramError> {
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

  const now = new Date()

  return ok({
    id: input.id,
    organizationId: input.organizationId,
    name: trimmedName,
    description: input.description ?? null,
    athleteId: input.athleteId ?? null,
    isTemplate: input.isTemplate ?? false,
    status: input.status ?? 'draft',
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  })
}

/**
 * Transition a program from draft to active.
 * Only draft programs can be activated.
 */
export function activateProgram(
  program: Program
): Result<Program, ProgramError> {
  if (program.status !== 'draft') {
    return err({
      type: 'INVALID_STATUS_TRANSITION',
      message: `Cannot activate program with status '${program.status}'. Only draft programs can be activated.`,
    })
  }

  return ok({
    ...program,
    status: 'active' as ProgramStatus,
    updatedAt: new Date(),
  })
}

/**
 * Transition a program to archived.
 * Both draft and active programs can be archived.
 * Archived programs cannot be archived again.
 */
export function archiveProgram(
  program: Program
): Result<Program, ProgramError> {
  if (program.status === 'archived') {
    return err({
      type: 'INVALID_STATUS_TRANSITION',
      message: 'Program is already archived.',
    })
  }

  return ok({
    ...program,
    status: 'archived' as ProgramStatus,
    updatedAt: new Date(),
  })
}
