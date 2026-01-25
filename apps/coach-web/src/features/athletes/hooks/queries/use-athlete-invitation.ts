import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch an athlete's current invitation details.
 * Returns invitation URL, status, and expiration info.
 * @param athleteId - The athlete ID to fetch invitation for (null to disable query)
 * @returns Query result with invitation details
 */
export function useAthleteInvitation(athleteId: string | null) {
  return useQuery({
    ...orpc.athletes.getInvitation.queryOptions({ input: { athleteId: athleteId ?? '' } }),
    enabled: !!athleteId,
  })
}
