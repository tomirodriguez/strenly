import type { ListAthleteLogsInput } from '@strenly/contracts/workout-logs'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch paginated workout logs for an athlete.
 * @param input - Filter and pagination parameters
 * @returns Query result with workout logs list and total count
 */
export function useAthleteLogs(input: ListAthleteLogsInput) {
  return useQuery({
    ...orpc.workoutLogs.listByAthlete.queryOptions({ input }),
    enabled: !!input.athleteId,
  })
}
