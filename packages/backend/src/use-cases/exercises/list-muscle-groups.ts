import {
  hasPermission,
  type MuscleGroupData,
  type MuscleGroupRepositoryPort,
  type OrganizationContext,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type ListMuscleGroupsInput = OrganizationContext

export type ListMuscleGroupsError =
  | { type: 'forbidden'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  muscleGroupRepository: MuscleGroupRepositoryPort
}

export const makeListMuscleGroups =
  (deps: Dependencies) =>
  (input: ListMuscleGroupsInput): ResultAsync<MuscleGroupData[], ListMuscleGroupsError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'exercises:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to list muscle groups',
      })
    }

    // 2. Query repository
    return deps.muscleGroupRepository.findAll().mapErr(
      (e): ListMuscleGroupsError => ({
        type: 'repository_error',
        message: e.type === 'DATABASE_ERROR' ? e.message : 'Failed to list muscle groups',
      }),
    )
  }
