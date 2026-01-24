import type { ListExercisesInput } from '@strenly/contracts/exercises/exercise'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Query keys factory for exercises
 */
export const exerciseKeys = {
  all: ['exercises'] as const,
  list: (filters: ListExercisesInput) => [...exerciseKeys.all, 'list', filters] as const,
  detail: (id: string) => [...exerciseKeys.all, 'detail', id] as const,
}

/**
 * Hook to query exercises with filtering and pagination
 */
export function useExercises(input: ListExercisesInput) {
  return useQuery(orpc.exercises.list.queryOptions({ input }))
}
