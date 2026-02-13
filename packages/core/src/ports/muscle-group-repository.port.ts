import type { ResultAsync } from 'neverthrow'

/**
 * Muscle group data from database.
 * Global lookup data - no organization scoping needed.
 */
export type MuscleGroupData = {
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly bodyRegion: 'upper' | 'lower' | 'core'
}

export type MuscleGroupRepositoryError =
  | { type: 'NOT_FOUND'; muscleGroupId: string }
  | { type: 'DATABASE_ERROR'; message: string }

/**
 * MuscleGroup Repository Interface.
 * Simple read-only repository for muscle group lookup data.
 * No OrganizationContext needed - muscle groups are global reference data.
 */
export type MuscleGroupRepositoryPort = {
  findAll(): ResultAsync<MuscleGroupData[], MuscleGroupRepositoryError>
  findById(id: string): ResultAsync<MuscleGroupData, MuscleGroupRepositoryError>
}
