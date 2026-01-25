import type { ListAthletesInput } from '@strenly/contracts/athletes/athlete'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a paginated, filtered list of athletes.
 * @param input - Filter and pagination parameters
 * @returns Query result with athletes list and total count
 */
export function useAthletes(input: ListAthletesInput) {
  return useQuery(orpc.athletes.list.queryOptions({ input }))
}
