import { muscleGroupInfoSchema, muscleGroupSchema } from '@strenly/contracts/exercises'
import { z } from 'zod'
import { createMuscleGroupRepository } from '../../infrastructure/repositories/muscle-group.repository'
import { authProcedure } from '../../lib/orpc'

/**
 * List all muscle groups
 * Requires authentication
 * Returns all muscle groups with display names and body regions
 */
export const listMuscleGroups = authProcedure
  .errors({
    INTERNAL_ERROR: { message: 'Failed to load muscle groups' },
  })
  .output(z.array(muscleGroupInfoSchema))
  .handler(async ({ context, errors }) => {
    const muscleGroupRepository = createMuscleGroupRepository(context.db)

    const result = await muscleGroupRepository.findAll()

    if (result.isErr()) {
      const error = result.error
      const errorMessage =
        error.type === 'DATABASE_ERROR' ? error.message : `Muscle group not found: ${error.muscleGroupId}`
      console.error('Muscle group repository error:', errorMessage)
      throw errors.INTERNAL_ERROR({ message: errorMessage })
    }

    // Parse the names through the schema to ensure type safety
    return result.value.map((mg) => {
      const parsedName = muscleGroupSchema.parse(mg.name)
      return {
        id: mg.id,
        name: parsedName,
        displayName: mg.displayName,
        bodyRegion: mg.bodyRegion,
      }
    })
  })
