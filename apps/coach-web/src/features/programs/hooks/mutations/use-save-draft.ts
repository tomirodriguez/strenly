import type { SaveDraftInput } from '@strenly/contracts/programs/save-draft'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'
import { toast } from '@/lib/toast'

/**
 * Hook to save the complete program aggregate.
 *
 * Uses the full aggregate approach - sends the entire program state
 * and the backend replaces it atomically.
 *
 * @param programId - The program ID for cache invalidation
 * @param onSuccess - Optional callback after successful save
 */
export function useSaveDraft(programId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.prescriptions.saveDraft.mutationOptions(),
    onSuccess: (data) => {
      // Invalidate program query to refresh data
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId } }),
      })

      // Show conflict warning if present
      if (data.conflictWarning) {
        toast.warning(data.conflictWarning)
      }

      // Call optional callback
      onSuccess?.()
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al guardar el programa' })
    },
  })
}

/**
 * Type for the save draft input - the mutation accepts the full aggregate
 */
export type { SaveDraftInput }
