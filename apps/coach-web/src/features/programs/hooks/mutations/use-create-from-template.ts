import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

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
      toast.success('Programa creado desde plantilla')
    },
    onError: (error) => {
      const message = error?.message ?? 'Error al crear el programa desde plantilla'
      toast.error(message)
    },
  })
}
