import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to delete a workout log.
 *
 * After successful deletion:
 * - Invalidates all workout log queries
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

      // Call optional callback
      onSuccess?.()
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al eliminar el workout' })
    },
  })
}
