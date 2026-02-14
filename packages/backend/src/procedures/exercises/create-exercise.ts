import { createExerciseInputSchema, exerciseSchema } from '@strenly/contracts/exercises'
import { createExerciseRepository } from '../../infrastructure/repositories/exercise.repository'
import { authProcedure } from '../../lib/orpc'
import { makeCreateExercise } from '../../use-cases/exercises/create-exercise'
import { mapExerciseToOutput } from './map-exercise-to-output'

/**
 * Create a custom exercise
 * Requires authentication and exercises:write permission
 */
export const createExercise = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create exercises' },
    VALIDATION_ERROR: { message: 'Invalid exercise data' },
  })
  .input(createExerciseInputSchema)
  .output(exerciseSchema)
  .handler(async ({ input, context, errors }) => {
    const createExerciseUseCase = makeCreateExercise({
      exerciseRepository: createExerciseRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })

    const result = await createExerciseUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      name: input.name,
      description: input.description,
      instructions: input.instructions,
      videoUrl: input.videoUrl,
      movementPattern: input.movementPattern,
      isUnilateral: input.isUnilateral,
      primaryMuscles: input.primaryMuscles,
      secondaryMuscles: input.secondaryMuscles,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'validation_error':
          throw errors.VALIDATION_ERROR({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw new Error('Internal error')
      }
    }

    const exercise = result.value

    return mapExerciseToOutput(exercise)
  })
