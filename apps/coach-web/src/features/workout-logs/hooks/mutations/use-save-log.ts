import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'
import { useLogStore } from '@/stores/log-store'

/**
 * Hook to save a workout log to the database.
 *
 * After successful save:
 * - Invalidates relevant queries (athlete logs, pending workouts)
 * - Calls markSaved() on log store to clear dirty flag
 * - Shows success toast
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
        queryKey: orpc.workoutLogs.get.queryOptions({ input: { logId: data.id } }).queryKey,
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

      // Show success toast
      toast.success('Workout guardado')

      // Call optional callback
      onSuccess?.()
    },
    onError: (error) => {
      const message = error?.message ?? 'Error al guardar el workout'
      toast.error(message)
    },
  })
}
