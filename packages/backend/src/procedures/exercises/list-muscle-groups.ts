import { muscleGroupInfoSchema } from '@strenly/contracts/exercises'
import { z } from 'zod'
import { createMuscleGroupRepository } from '../../infrastructure/repositories/muscle-group.repository'
import { authProcedure } from '../../lib/orpc'
import { makeListMuscleGroups } from '../../use-cases/exercises/list-muscle-groups'

/**
 * List all muscle groups
 * Requires authentication and exercises:read permission
 * Returns all muscle groups with display names and body regions
 */
export const listMuscleGroups = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to list muscle groups' },
    INTERNAL_ERROR: { message: 'Failed to load muscle groups' },
  })
  .output(z.array(muscleGroupInfoSchema))
  .handler(async ({ context, errors }) => {
    const listMuscleGroupsUseCase = makeListMuscleGroups({
      muscleGroupRepository: createMuscleGroupRepository(context.db),
    })

    const result = await listMuscleGroupsUseCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error:', result.error.message)
          throw errors.INTERNAL_ERROR({ message: result.error.message })
      }
    }

    // Repository validates names, return directly
    return result.value
  })
