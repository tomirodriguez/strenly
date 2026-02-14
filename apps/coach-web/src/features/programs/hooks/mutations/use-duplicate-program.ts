import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to duplicate an existing program.
 * Invalidates programs list cache on success.
 * @returns Mutation result with duplicateProgram function
 */
export function useDuplicateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.duplicate.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.programs.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al duplicar el programa' })
    },
  })
}
