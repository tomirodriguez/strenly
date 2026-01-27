import type { ListPendingWorkoutsInput } from '@strenly/contracts/workout-logs'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch pending workouts (sessions without logs).
 * Used for the workout logging dashboard.
 * @param input - Pagination parameters
 * @returns Query result with pending workouts list and total count
 */
export function usePendingWorkouts(input?: ListPendingWorkoutsInput) {
  return useQuery(orpc.workoutLogs.listPending.queryOptions({ input: input ?? {} }))
}
