import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to archive a program.
 * Invalidates programs list cache on success.
 * @returns Mutation result with archiveProgram function
 */
export function useArchiveProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.archive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.programs.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al archivar el programa' })
    },
  })
}
