import type { ListAthletesInput } from '@strenly/contracts/athletes/athlete'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Query key factory for athlete queries.
 * Provides consistent cache keys for athlete-related data.
 */
export const athleteKeys = {
  all: ['athletes'] as const,
  list: (filters: ListAthletesInput) => [...athleteKeys.all, 'list', filters] as const,
  detail: (id: string) => [...athleteKeys.all, 'detail', id] as const,
}

/**
 * Hook to fetch a paginated, filtered list of athletes.
 * @param input - Filter and pagination parameters
 * @returns Query result with athletes list and total count
 */
export function useAthletes(input: ListAthletesInput) {
  return useQuery(orpc.athletes.list.queryOptions({ input }))
}
