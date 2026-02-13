import { deleteLogInputSchema } from '@strenly/contracts/workout-logs'
import { z } from 'zod'
import { createWorkoutLogRepository } from '../../infrastructure/repositories/workout-log.repository'
import { authProcedure } from '../../lib/orpc'
import { makeDeleteLog } from '../../use-cases/workout-logs/delete-log'

/**
 * Delete a workout log by ID.
 */
export const deleteLog = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to delete workout logs' },
    NOT_FOUND: { message: 'Workout log not found' },
    INTERNAL_ERROR: { message: 'Internal server error' },
  })
  .input(deleteLogInputSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context, errors }) => {
    const useCase = makeDeleteLog({
      workoutLogRepository: createWorkoutLogRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      logId: input.logId,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'not_found':
          throw errors.NOT_FOUND({ message: `Workout log ${result.error.logId} not found` })
        case 'repository_error':
          console.error('Repository error in deleteLog:', result.error.message)
          throw errors.INTERNAL_ERROR({ message: 'Error al acceder a la base de datos' })
      }
    }

    return { success: true }
  })
