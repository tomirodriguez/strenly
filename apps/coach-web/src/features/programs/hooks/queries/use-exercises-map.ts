import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { orpc } from '@/lib/api-client'

/**
 * Returns a Map of exerciseId -> exerciseName for display in the grid.
 * Exercises are cached, so this is efficient even with multiple components using it.
 *
 * The grid needs to display exercise names, but the Program aggregate only contains exerciseIds.
 * This hook provides the lookup for efficient client-side "join".
 *
 * TODO: Fetch exercises on-demand when user wants to add an exercise, not on initial load.
 */
export function useExercisesMap() {
  const { data: exercises, ...rest } = useQuery({
    ...orpc.exercises.list.queryOptions({
      input: { limit: 100 }, // API max is 100; sufficient for most programs
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes - exercises don't change often
  })

  // Build Map for O(1) lookup - memoized to prevent new reference on each render
  const exercisesMap = useMemo(() => {
    const map = new Map<string, string>()
    if (exercises?.items) {
      for (const exercise of exercises.items) {
        map.set(exercise.id, exercise.name)
      }
    }
    return map
  }, [exercises])

  return {
    exercisesMap,
    isLoading: rest.isLoading,
    error: rest.error,
  }
}
