import {
  type Exercise,
  type ExerciseRepositoryPort,
  hasPermission,
  type OrganizationContext,
  type Role,
} from '@strenly/core'
import { errAsync, okAsync, type ResultAsync } from 'neverthrow'

export type GetExerciseInput = OrganizationContext & {
  memberRole: Role
  exerciseId: string
}

export type GetExerciseError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; exerciseId: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  exerciseRepository: ExerciseRepositoryPort
}

export const makeGetExercise =
  (deps: Dependencies) =>
  (input: GetExerciseInput): ResultAsync<Exercise, GetExerciseError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'exercises:read')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to view exercises',
      })
    }

    // 2. Fetch exercise with organization scope (repository handles access control)
    return deps.exerciseRepository
      .findById(input.organizationId, input.exerciseId)
      .mapErr(
        (e): GetExerciseError => ({
          type: 'repository_error',
          message: e.type === 'DATABASE_ERROR' ? e.message : 'Database error',
        }),
      )
      .andThen((exercise) => {
        // 3. Check if found (null means not found or no access)
        if (exercise === null) {
          return errAsync<Exercise, GetExerciseError>({
            type: 'not_found',
            exerciseId: input.exerciseId,
          })
        }

        return okAsync<Exercise, GetExerciseError>(exercise)
      })
  }
