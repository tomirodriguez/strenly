import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to create a new program from a template.
 * Invalidates programs cache on success.
 * @returns Mutation result with createFromTemplate function
 */
export function useCreateFromTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.templates.createFrom.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.programs.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al crear el programa desde plantilla' })
    },
  })
}
