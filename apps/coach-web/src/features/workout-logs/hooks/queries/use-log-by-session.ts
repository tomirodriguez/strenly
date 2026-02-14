import type { GetLogBySessionInput } from '@strenly/contracts/workout-logs/list-logs'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a workout log by athlete, session, and week combination.
 *
 * Returns null if no log exists for this combination.
 * Used to implement get-or-create logic in session logging.
 *
 * @param input - athleteId, sessionId, weekId
 * @returns Query result with the workout log or null
 */
export function useLogBySession(input: GetLogBySessionInput) {
  const { athleteId, sessionId, weekId } = input
  const enabled = Boolean(athleteId && sessionId && weekId)

  return useQuery({
    ...orpc.workoutLogs.getBySession.queryOptions({ input }),
    enabled,
  })
}
