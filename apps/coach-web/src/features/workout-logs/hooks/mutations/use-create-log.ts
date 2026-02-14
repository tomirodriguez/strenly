import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to create a new workout log from prescription.
 *
 * Creates a pre-filled log for client-side editing.
 * The returned log is NOT persisted - use useSaveLog after editing.
 *
 * @returns Mutation result with createLog function
 */
export function useCreateLog() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.workoutLogs.create.mutationOptions(),
    // Disable retry to prevent infinite loops on error
    retry: false,
    onSuccess: () => {
      // Invalidate pending workouts since this may remove one
      queryClient.invalidateQueries({ queryKey: orpc.workoutLogs.listPending.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al crear el log de entrenamiento' })
    },
  })
}
