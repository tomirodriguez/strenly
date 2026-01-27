import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

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
    onSuccess: () => {
      // Invalidate pending workouts since this may remove one
      queryClient.invalidateQueries({ queryKey: orpc.workoutLogs.listPending.key() })
    },
  })
}
