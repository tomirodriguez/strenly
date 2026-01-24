import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Query keys factory for muscle groups
 */
export const muscleGroupKeys = {
  all: ['muscle-groups'] as const,
}

/**
 * Hook to query all muscle groups for filter dropdowns
 */
export function useMuscleGroups() {
  return useQuery(orpc.exercises.muscleGroups.queryOptions({}))
}
