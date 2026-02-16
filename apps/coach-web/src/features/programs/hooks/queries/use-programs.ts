import type { ListProgramsQuery } from '@strenly/contracts/programs/program'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a paginated, filtered list of programs.
 * @param input - Filter and pagination parameters
 * @returns Query result with programs list and total count
 */
export function usePrograms(input?: ListProgramsQuery) {
  return useQuery(orpc.programs.list.queryOptions({ input: input ?? {} }))
}
