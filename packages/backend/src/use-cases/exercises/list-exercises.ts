import {
  type Exercise,
  type ExerciseRepositoryPort,
  hasPermission,
  type MovementPattern,
  type MuscleGroup,
  type OrganizationContext,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ListExercisesInput = OrganizationContext & {
  memberRole: Role
  movementPattern?: MovementPattern
  muscleGroup?: MuscleGroup
  search?: string
  includeArchived?: boolean
  limit?: number
  offset?: number
}

export type ListExercisesResult = {
  items: Exercise[]
  totalCount: number
}

export type ListExercisesError = { type: 'forbidden'; message: string } | { type: 'repository_error'; message: string }

type Dependencies = {
  exerciseRepository: ExerciseRepositoryPort
}

export const makeListExercises =
  (deps: Dependencies) =>
  (input: ListExercisesInput): ResultAsync<ListExercisesResult, ListExercisesError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'exercises:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to list exercises',
      })
    }

    // 2. Query repository - includes curated (null orgId) + org's custom exercises
    return deps.exerciseRepository
      .findAll({
        organizationId: input.organizationId,
        movementPattern: input.movementPattern,
        muscleGroup: input.muscleGroup,
        search: input.search,
        includeArchived: input.includeArchived,
        limit: input.limit,
        offset: input.offset,
      })
      .mapErr(
        (e): ListExercisesError => ({
          type: 'repository_error',
          message: e.type === 'DATABASE_ERROR' ? e.message : 'Failed to list exercises',
        }),
      )
  }
