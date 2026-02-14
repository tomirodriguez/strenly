import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to create a new program.
 * Invalidates programs list cache on success.
 * @returns Mutation result with createProgram function
 */
export function useCreateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.programs.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al crear el programa' })
    },
  })
}
