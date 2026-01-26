import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Returns a Map of exerciseId -> exerciseName for display in the grid.
 * Exercises are cached, so this is efficient even with multiple components using it.
 *
 * The grid needs to display exercise names, but the Program aggregate only contains exerciseIds.
 * This hook provides the lookup for efficient client-side "join".
 */
export function useExercisesMap() {
  const { data: exercises, ...rest } = useQuery({
    ...orpc.exercises.list.queryOptions({
      input: { limit: 1000 }, // Fetch all exercises (usually < 500)
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes - exercises don't change often
  })

  // Build Map for O(1) lookup
  const exercisesMap = new Map<string, string>()
  if (exercises?.items) {
    for (const exercise of exercises.items) {
      exercisesMap.set(exercise.id, exercise.name)
    }
  }

  return {
    exercisesMap,
    isLoading: rest.isLoading,
    error: rest.error,
  }
}
