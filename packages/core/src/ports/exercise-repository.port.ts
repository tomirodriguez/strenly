import type { ResultAsync } from 'neverthrow'
import type { Exercise } from '../domain/entities/exercise'
import type { MovementPattern } from '../domain/entities/movement-pattern'
import type { MuscleGroup } from '../domain/entities/muscle-group'

export type ExerciseRepositoryError =
  | { type: 'NOT_FOUND'; exerciseId: string }
  | { type: 'DATABASE_ERROR'; message: string }

export type ListExercisesOptions = {
  // null = curated only, string = org-specific, undefined = all available
  organizationId?: string | null
  movementPattern?: MovementPattern
  muscleGroup?: MuscleGroup
  search?: string
  includeArchived?: boolean
  limit?: number
  offset?: number
}

export type ExerciseRepositoryPort = {
  findById(id: string): ResultAsync<Exercise, ExerciseRepositoryError>
  findAll(
    options?: ListExercisesOptions,
  ): ResultAsync<{ items: Exercise[]; totalCount: number }, ExerciseRepositoryError>
  create(exercise: Exercise): ResultAsync<Exercise, ExerciseRepositoryError>
  update(exercise: Exercise): ResultAsync<Exercise, ExerciseRepositoryError>
  archive(id: string): ResultAsync<void, ExerciseRepositoryError>
}
