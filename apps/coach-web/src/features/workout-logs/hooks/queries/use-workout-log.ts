import type { GetLogInput } from '@strenly/contracts/workout-logs'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a single workout log by ID.
 * @param logId - The workout log ID to fetch
 * @returns Query result with the full workout log aggregate
 */
export function useWorkoutLog(logId: string) {
  const input: GetLogInput = { logId }
  return useQuery({
    ...orpc.workoutLogs.get.queryOptions({ input }),
    enabled: !!logId,
  })
}
