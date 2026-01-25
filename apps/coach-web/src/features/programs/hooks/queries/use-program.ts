import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a single program with full details for grid view.
 * @param programId - The program ID to fetch
 * @returns Query result with program details including weeks, sessions, and rows
 */
export function useProgram(programId: string) {
  return useQuery({
    ...orpc.programs.get.queryOptions({ input: { programId } }),
    enabled: !!programId,
  })
}
