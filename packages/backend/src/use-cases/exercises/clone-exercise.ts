import {
  createExercise,
  type Exercise,
  type ExerciseRepositoryPort,
  hasPermission,
  isCurated,
  type OrganizationContext,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type CloneExerciseInput = OrganizationContext & {
  memberRole: Role
  sourceExerciseId: string
  name?: string
}

export type CloneExerciseError =
  | { type: 'forbidden'; message: string }
  | { type: 'source_not_found'; exerciseId: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  exerciseRepository: ExerciseRepositoryPort
  generateId: () => string
}

export const makeCloneExercise =
  (deps: Dependencies) =>
  (input: CloneExerciseInput): ResultAsync<Exercise, CloneExerciseError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'exercises:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to clone exercises',
      })
    }

    // 2. Fetch source exercise
    return deps.exerciseRepository
      .findById(input.sourceExerciseId)
      .mapErr(
        (e): CloneExerciseError =>
          e.type === 'NOT_FOUND'
            ? { type: 'source_not_found', exerciseId: input.sourceExerciseId }
            : { type: 'repository_error', message: e.type === 'DATABASE_ERROR' ? e.message : `Unknown error` },
      )
      .andThen((source) => {
        // 3. Verify access - can only clone curated or own custom exercises
        if (!isCurated(source) && source.organizationId !== input.organizationId) {
          return errAsync<Exercise, CloneExerciseError>({
            type: 'source_not_found',
            exerciseId: input.sourceExerciseId,
          })
        }

        // 4. Create cloned exercise
        const clonedName = input.name ?? `${source.name} (Custom)`
        const clonedResult = createExercise({
          id: deps.generateId(),
          organizationId: input.organizationId,
          name: clonedName,
          description: source.description,
          instructions: source.instructions,
          videoUrl: source.videoUrl,
          movementPattern: source.movementPattern,
          isUnilateral: source.isUnilateral,
          clonedFromId: source.id,
          primaryMuscles: [...source.primaryMuscles],
          secondaryMuscles: [...source.secondaryMuscles],
        })

        if (clonedResult.isErr()) {
          return errAsync<Exercise, CloneExerciseError>({
            type: 'validation_error',
            message: clonedResult.error.message,
          })
        }

        // 5. Persist cloned exercise
        return deps.exerciseRepository.create(clonedResult.value).mapErr(
          (e): CloneExerciseError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Exercise not found: ${e.exerciseId}`,
          }),
        )
      })
  }
