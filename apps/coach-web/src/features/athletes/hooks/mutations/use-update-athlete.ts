import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to update an existing athlete.
 * Invalidates athlete list and detail cache on success.
 * @returns Mutation result with updateAthlete function
 */
export function useUpdateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al actualizar el atleta' })
    },
  })
}
