import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'
import { useLogStore } from '@/stores/log-store'

/**
 * Hook to save a workout log to the database.
 *
 * After successful save:
 * - Invalidates relevant queries (athlete logs, pending workouts)
 * - Calls markSaved() on log store to clear dirty flag
 *
 * @param onSuccess - Optional callback after successful save
 * @returns Mutation result with saveLog function
 */
export function useSaveLog(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  const markSaved = useLogStore((state) => state.markSaved)

  return useMutation({
    ...orpc.workoutLogs.save.mutationOptions(),
    onSuccess: (data) => {
      // Invalidate the specific log query
      queryClient.invalidateQueries({
        queryKey: orpc.workoutLogs.get.key({ input: { logId: data.id } }),
      })

      // Invalidate athlete logs
      queryClient.invalidateQueries({
        queryKey: orpc.workoutLogs.listByAthlete.key(),
      })

      // Invalidate pending workouts
      queryClient.invalidateQueries({
        queryKey: orpc.workoutLogs.listPending.key(),
      })

      // Clear dirty flag in store
      markSaved()

      // Call optional callback
      onSuccess?.()
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al guardar el workout' })
    },
  })
}
