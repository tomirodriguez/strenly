import { listPendingWorkoutsInputSchema, listPendingWorkoutsOutputSchema } from '@strenly/contracts/workout-logs'
import { createWorkoutLogRepository } from '../../infrastructure/repositories/workout-log.repository'
import { authProcedure } from '../../lib/orpc'
import { makeListPendingWorkouts } from '../../use-cases/workout-logs/list-pending-workouts'

/**
 * List pending workouts (sessions without logs).
 * Used for the logging dashboard.
 */
export const listPendingWorkouts = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to view workout logs' },
    INTERNAL_ERROR: { message: 'Internal server error' },
  })
  .input(listPendingWorkoutsInputSchema)
  .output(listPendingWorkoutsOutputSchema)
  .handler(async ({ input, context, errors }) => {
    const useCase = makeListPendingWorkouts({
      workoutLogRepository: createWorkoutLogRepository(context.db),
    })

    const result = await useCase({
      organizationId: context.organization.id,
      userId: context.user.id,
      memberRole: context.membership.role,
      limit: input.limit,
      offset: input.offset,
    })

    if (result.isErr()) {
      switch (result.error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN({ message: result.error.message })
        case 'repository_error':
          console.error('Repository error in listPendingWorkouts:', result.error.message)
          throw errors.INTERNAL_ERROR({ message: 'Error al acceder a la base de datos' })
      }
    }

    return result.value
  })
