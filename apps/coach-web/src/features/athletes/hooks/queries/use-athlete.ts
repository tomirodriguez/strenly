import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a single athlete by ID.
 * @param athleteId - The athlete ID to fetch
 * @returns Query result with athlete details
 */
export function useAthlete(athleteId: string) {
  return useQuery({
    ...orpc.athletes.get.queryOptions({ input: { athleteId } }),
    enabled: !!athleteId,
  })
}
