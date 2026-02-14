import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to create a new athlete.
 * Invalidates athlete list cache on success.
 * @returns Mutation result with createAthlete function
 */
export function useCreateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Failed to create athlete' })
    },
  })
}
