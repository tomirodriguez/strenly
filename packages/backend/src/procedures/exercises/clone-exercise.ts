import { cloneExerciseInputSchema, exerciseSchema } from '@strenly/contracts/exercises'
import { createExerciseRepository } from '../../infrastructure/repositories/exercise.repository'
import { authProcedure } from '../../lib/orpc'
import { makeCloneExercise } from '../../use-cases/exercises/clone-exercise'

/**
 * Clone an exercise to create a custom copy
 * Requires authentication and exercises:write permission
 * Can clone curated or own custom exercises
 */
export const cloneExercise = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to clone exercises' },
    SOURCE_NOT_FOUND: { message: 'Source exercise not found' },
    VALIDATION_ERROR: { message: 'Invalid exercise data' },
  })
  .input(cloneExerciseInputSchema)
  .output(exerciseSchema)
  .handler(async ({ input, context, errors }) => {
    const cloneExerciseUseCase = makeCloneExercise({
      exerciseRepository: createExerciseRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await cloneExerciseUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      sourceExerciseId: input.sourceExerciseId,
      name: input.name,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'source_not_found':
          throw errors.SOURCE_NOT_FOUND({ message: `Source exercise not found: ${result.error.exerciseId}` })
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const exercise = result.value

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
  })
