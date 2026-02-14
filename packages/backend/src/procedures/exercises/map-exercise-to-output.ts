import type { Exercise } from '@strenly/core/domain/entities/exercise'

/**
 * Shared helper: Map Exercise domain entity to contract output
 */
export function mapExerciseToOutput(exercise: Exercise) {
  return {
    id: exercise.id,
    organizationId: exercise.organizationId,
    name: exercise.name,
    description: exercise.description,
    instructions: exercise.instructions,
    videoUrl: exercise.videoUrl,
    movementPattern: exercise.movementPattern,
    isUnilateral: exercise.isUnilateral,
    isCurated: exercise.organizationId === null,
    clonedFromId: exercise.clonedFromId,
    primaryMuscles: [...exercise.primaryMuscles],
    secondaryMuscles: [...exercise.secondaryMuscles],
    archivedAt: exercise.archivedAt?.toISOString() ?? null,
    createdAt: exercise.createdAt.toISOString(),
    updatedAt: exercise.updatedAt.toISOString(),
  }
}
