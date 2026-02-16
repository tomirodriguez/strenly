import { err, ok, type Result } from 'neverthrow'
import { isValidMovementPattern, type MovementPattern } from '../value-objects/movement-pattern'
import { isValidMuscleGroup, type MuscleGroup } from '../value-objects/muscle-group'

export type Exercise = {
  readonly id: string
  readonly organizationId: string | null // null = curated (global), string = custom (org-specific)
  readonly name: string
  readonly description: string | null
  readonly instructions: string | null
  readonly videoUrl: string | null
  readonly movementPattern: MovementPattern | null
  readonly isUnilateral: boolean
  readonly clonedFromId: string | null
  readonly primaryMuscles: readonly MuscleGroup[]
  readonly secondaryMuscles: readonly MuscleGroup[]
  readonly archivedAt: Date | null
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type ExerciseError =
  | { type: 'INVALID_NAME'; message: string }
  | { type: 'INVALID_VIDEO_URL'; message: string }
  | { type: 'INVALID_MOVEMENT_PATTERN'; message: string }
  | { type: 'INVALID_MUSCLE_GROUP'; message: string }
  | { type: 'ALREADY_ARCHIVED'; message: string }
  | { type: 'NOT_ARCHIVED'; message: string }

type CreateExerciseInput = {
  id: string
  name: string
  organizationId?: string | null
  description?: string | null
  instructions?: string | null
  videoUrl?: string | null
  movementPattern?: MovementPattern | null
  isUnilateral?: boolean
  clonedFromId?: string | null
  primaryMuscles?: MuscleGroup[]
  secondaryMuscles?: MuscleGroup[]
  archivedAt?: Date | null
}

/**
 * Reconstitute an Exercise from database props without validation.
 * Used when loading from the database where data is already known to be valid.
 */
export function reconstituteExercise(props: Exercise): Exercise {
  return { ...props }
}

export function createExercise(input: CreateExerciseInput): Result<Exercise, ExerciseError> {
  // Validate name
  const trimmedName = input.name.trim()
  if (!trimmedName || trimmedName.length === 0) {
    return err({ type: 'INVALID_NAME', message: 'Exercise name is required' })
  }
  if (trimmedName.length > 100) {
    return err({ type: 'INVALID_NAME', message: 'Exercise name must not exceed 100 characters' })
  }

  // Validate videoUrl if provided
  if (input.videoUrl !== undefined && input.videoUrl !== null) {
    try {
      new URL(input.videoUrl)
    } catch {
      return err({ type: 'INVALID_VIDEO_URL', message: 'Video URL must be a valid URL' })
    }
  }

  // Validate movementPattern if provided
  if (input.movementPattern !== undefined && input.movementPattern !== null) {
    if (!isValidMovementPattern(input.movementPattern)) {
      return err({ type: 'INVALID_MOVEMENT_PATTERN', message: 'Invalid movement pattern' })
    }
  }

  // Validate primaryMuscles if provided
  const primaryMuscles = input.primaryMuscles ?? []
  for (const muscle of primaryMuscles) {
    if (!isValidMuscleGroup(muscle)) {
      return err({ type: 'INVALID_MUSCLE_GROUP', message: `Invalid primary muscle group: ${muscle}` })
    }
  }

  // Validate secondaryMuscles if provided
  const secondaryMuscles = input.secondaryMuscles ?? []
  for (const muscle of secondaryMuscles) {
    if (!isValidMuscleGroup(muscle)) {
      return err({ type: 'INVALID_MUSCLE_GROUP', message: `Invalid secondary muscle group: ${muscle}` })
    }
  }

  const now = new Date()

  return ok({
    id: input.id,
    organizationId: input.organizationId ?? null,
    name: trimmedName,
    description: input.description ?? null,
    instructions: input.instructions ?? null,
    videoUrl: input.videoUrl ?? null,
    movementPattern: input.movementPattern ?? null,
    isUnilateral: input.isUnilateral ?? false,
    clonedFromId: input.clonedFromId ?? null,
    primaryMuscles,
    secondaryMuscles,
    archivedAt: input.archivedAt ?? null,
    createdAt: now,
    updatedAt: now,
  })
}

type UpdateExerciseInput = {
  name?: string
  description?: string | null
  instructions?: string | null
  videoUrl?: string | null
  movementPattern?: MovementPattern | null
  isUnilateral?: boolean
  primaryMuscles?: MuscleGroup[]
  secondaryMuscles?: MuscleGroup[]
}

/**
 * Update an exercise's details with validation.
 * Only the provided fields are updated; undefined fields are kept unchanged.
 */
export function updateExercise(exercise: Exercise, updates: UpdateExerciseInput): Result<Exercise, ExerciseError> {
  // Validate name if provided
  if (updates.name !== undefined) {
    const trimmedName = updates.name.trim()
    if (!trimmedName || trimmedName.length === 0) {
      return err({ type: 'INVALID_NAME', message: 'Exercise name is required' })
    }
    if (trimmedName.length > 100) {
      return err({ type: 'INVALID_NAME', message: 'Exercise name must not exceed 100 characters' })
    }
  }

  // Validate videoUrl if provided
  if (updates.videoUrl !== undefined && updates.videoUrl !== null) {
    try {
      new URL(updates.videoUrl)
    } catch {
      return err({ type: 'INVALID_VIDEO_URL', message: 'Video URL must be a valid URL' })
    }
  }

  // Validate movementPattern if provided
  if (updates.movementPattern !== undefined && updates.movementPattern !== null) {
    if (!isValidMovementPattern(updates.movementPattern)) {
      return err({ type: 'INVALID_MOVEMENT_PATTERN', message: 'Invalid movement pattern' })
    }
  }

  // Validate primaryMuscles if provided
  if (updates.primaryMuscles !== undefined) {
    for (const muscle of updates.primaryMuscles) {
      if (!isValidMuscleGroup(muscle)) {
        return err({ type: 'INVALID_MUSCLE_GROUP', message: `Invalid primary muscle group: ${muscle}` })
      }
    }
  }

  // Validate secondaryMuscles if provided
  if (updates.secondaryMuscles !== undefined) {
    for (const muscle of updates.secondaryMuscles) {
      if (!isValidMuscleGroup(muscle)) {
        return err({ type: 'INVALID_MUSCLE_GROUP', message: `Invalid secondary muscle group: ${muscle}` })
      }
    }
  }

  return ok({
    ...exercise,
    name: updates.name !== undefined ? updates.name.trim() : exercise.name,
    description: updates.description !== undefined ? (updates.description ?? null) : exercise.description,
    instructions: updates.instructions !== undefined ? (updates.instructions ?? null) : exercise.instructions,
    videoUrl: updates.videoUrl !== undefined ? (updates.videoUrl ?? null) : exercise.videoUrl,
    movementPattern:
      updates.movementPattern !== undefined ? (updates.movementPattern ?? null) : exercise.movementPattern,
    isUnilateral: updates.isUnilateral !== undefined ? updates.isUnilateral : exercise.isUnilateral,
    primaryMuscles: updates.primaryMuscles !== undefined ? updates.primaryMuscles : exercise.primaryMuscles,
    secondaryMuscles: updates.secondaryMuscles !== undefined ? updates.secondaryMuscles : exercise.secondaryMuscles,
    updatedAt: new Date(),
  })
}

/**
 * Archive an exercise. Returns error if already archived.
 */
export function archiveExercise(exercise: Exercise): Result<Exercise, ExerciseError> {
  if (exercise.archivedAt !== null) {
    return err({ type: 'ALREADY_ARCHIVED', message: 'Exercise is already archived' })
  }

  return ok({
    ...exercise,
    archivedAt: new Date(),
    updatedAt: new Date(),
  })
}

/**
 * Unarchive an exercise. Returns error if not archived.
 */
export function unarchiveExercise(exercise: Exercise): Result<Exercise, ExerciseError> {
  if (exercise.archivedAt === null) {
    return err({ type: 'NOT_ARCHIVED', message: 'Exercise is not archived' })
  }

  return ok({
    ...exercise,
    archivedAt: null,
    updatedAt: new Date(),
  })
}

// Helper functions
export function isCurated(exercise: Pick<Exercise, 'organizationId'>): boolean {
  return exercise.organizationId === null
}

export function isCustom(exercise: Pick<Exercise, 'organizationId'>): boolean {
  return exercise.organizationId !== null
}

export function isArchived(exercise: Pick<Exercise, 'archivedAt'>): boolean {
  return exercise.archivedAt !== null
}
