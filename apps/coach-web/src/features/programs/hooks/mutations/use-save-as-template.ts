import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to save a program as a template.
 * Invalidates programs and templates caches on success.
 * @returns Mutation result with saveAsTemplate function
 */
export function useSaveAsTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.templates.saveAs.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.programs.key() })
      queryClient.invalidateQueries({ queryKey: orpc.programs.templates.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al guardar la plantilla' })
    },
  })
}
