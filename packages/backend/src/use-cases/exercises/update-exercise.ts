import {
  createExercise,
  type Exercise,
  type ExerciseRepositoryPort,
  hasPermission,
  isCurated,
  type MovementPattern,
  type MuscleGroup,
  type OrganizationContext,
  type Role,
} from '@strenly/core'
import { errAsync, type ResultAsync } from 'neverthrow'

export type UpdateExerciseInput = OrganizationContext & {
  memberRole: Role
  exerciseId: string
  name?: string
  description?: string | null
  instructions?: string | null
  videoUrl?: string | null
  movementPattern?: MovementPattern | null
  isUnilateral?: boolean
  primaryMuscles?: MuscleGroup[]
  secondaryMuscles?: MuscleGroup[]
}

export type UpdateExerciseError =
  | { type: 'forbidden'; message: string }
  | { type: 'not_found'; exerciseId: string }
  | { type: 'cannot_edit_curated'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; message: string }

type Dependencies = {
  exerciseRepository: ExerciseRepositoryPort
}

export const makeUpdateExercise =
  (deps: Dependencies) =>
  (input: UpdateExerciseInput): ResultAsync<Exercise, UpdateExerciseError> => {
    // 1. Authorization FIRST
    if (!hasPermission(input.memberRole, 'exercises:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to update exercises',
      })
    }

    // 2. Fetch existing exercise (repository handles org scope)
    return deps.exerciseRepository
      .findById(input.organizationId, input.exerciseId)
      .mapErr(
        (e): UpdateExerciseError => ({
          type: 'repository_error',
          message: e.type === 'DATABASE_ERROR' ? e.message : 'Database error',
        }),
      )
      .andThen((existing) => {
        // 3. Check if found
        if (existing === null) {
          return errAsync<Exercise, UpdateExerciseError>({
            type: 'not_found',
            exerciseId: input.exerciseId,
          })
        }

        // 4. Cannot edit curated exercises
        if (isCurated(existing)) {
          return errAsync<Exercise, UpdateExerciseError>({
            type: 'cannot_edit_curated',
            message: 'Cannot edit curated exercises. Clone it to create a custom version.',
          })
        }

        // 5. Merge updates with existing
        const updatedResult = createExercise({
          id: existing.id,
          organizationId: existing.organizationId,
          name: input.name ?? existing.name,
          description: input.description !== undefined ? input.description : existing.description,
          instructions: input.instructions !== undefined ? input.instructions : existing.instructions,
          videoUrl: input.videoUrl !== undefined ? input.videoUrl : existing.videoUrl,
          movementPattern: input.movementPattern !== undefined ? input.movementPattern : existing.movementPattern,
          isUnilateral: input.isUnilateral !== undefined ? input.isUnilateral : existing.isUnilateral,
          clonedFromId: existing.clonedFromId,
          primaryMuscles: input.primaryMuscles ?? [...existing.primaryMuscles],
          secondaryMuscles: input.secondaryMuscles ?? [...existing.secondaryMuscles],
          archivedAt: existing.archivedAt,
          createdAt: existing.createdAt,
        })

        if (updatedResult.isErr()) {
          return errAsync<Exercise, UpdateExerciseError>({
            type: 'validation_error',
            message: updatedResult.error.message,
          })
        }

        // 6. Persist update with organization scope
        const ctx: OrganizationContext = {
          organizationId: input.organizationId,
          userId: input.userId,
          memberRole: input.memberRole,
        }

        return deps.exerciseRepository.update(ctx, updatedResult.value).mapErr(
          (e): UpdateExerciseError => ({
            type: 'repository_error',
            message: e.type === 'DATABASE_ERROR' ? e.message : `Exercise not found: ${e.exerciseId}`,
          }),
        )
      })
  }
