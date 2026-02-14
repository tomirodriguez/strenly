import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to archive an athlete (set status to inactive).
 * Invalidates athlete list cache on success.
 * @returns Mutation result with archiveAthlete function
 */
export function useArchiveAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.archive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al archivar el atleta' })
    },
  })
}
