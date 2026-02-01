import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to query all muscle groups for filter dropdowns.
 * Uses oRPC's built-in key factory via orpc.exercises.key() for cache invalidation.
 */
export function useMuscleGroups() {
  return useQuery(orpc.exercises.muscleGroups.queryOptions({}))
}
