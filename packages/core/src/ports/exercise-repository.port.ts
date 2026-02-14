import type { ResultAsync } from 'neverthrow'
import type { Exercise } from '../domain/entities/exercise'
import type { MovementPattern } from '../domain/entities/movement-pattern'
import type { MuscleGroup } from '../domain/entities/muscle-group'
import type { OrganizationContext } from '../types/organization-context'

export type ExerciseRepositoryError =
  | { type: 'NOT_FOUND'; exerciseId: string }
  | { type: 'DATABASE_ERROR'; message: string; cause?: unknown }

export type ListExercisesOptions = {
  movementPattern?: MovementPattern
  muscleGroup?: MuscleGroup
  search?: string
  includeArchived?: boolean
  limit: number
  offset: number
}

export type ExerciseRepositoryPort = {
  /**
   * Find exercise by ID with organization scope.
   * Returns exercise if it's curated (organizationId is null) OR belongs to the specified organization.
   */
  findById(ctx: OrganizationContext, id: string): ResultAsync<Exercise | null, ExerciseRepositoryError>
  findAll(
    ctx: OrganizationContext,
    options: ListExercisesOptions,
  ): ResultAsync<{ items: Exercise[]; totalCount: number }, ExerciseRepositoryError>
  /**
   * Create a new exercise in the organization.
   */
  create(ctx: OrganizationContext, exercise: Exercise): ResultAsync<Exercise, ExerciseRepositoryError>
  /**
   * Update an existing exercise within the organization.
   */
  update(ctx: OrganizationContext, exercise: Exercise): ResultAsync<Exercise, ExerciseRepositoryError>
  /**
   * Archive an exercise (soft delete) within the organization.
   */
  archive(ctx: OrganizationContext, id: string): ResultAsync<void, ExerciseRepositoryError>
}
