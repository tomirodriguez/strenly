import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

/**
 * Hook to delete a workout log.
 *
 * After successful deletion:
 * - Invalidates all workout log queries
 * - Shows success toast
 *
 * @param onSuccess - Optional callback after successful deletion
 * @returns Mutation result with deleteLog function
 */
export function useDeleteLog(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.workoutLogs.delete.mutationOptions(),
    onSuccess: () => {
      // Invalidate all workout log queries
      queryClient.invalidateQueries({ queryKey: orpc.workoutLogs.key() })

      // Show success toast
      toast.success('Workout eliminado')

      // Call optional callback
      onSuccess?.()
    },
    onError: (error) => {
      const message = error?.message ?? 'Error al eliminar el workout'
      toast.error(message)
    },
  })
}
