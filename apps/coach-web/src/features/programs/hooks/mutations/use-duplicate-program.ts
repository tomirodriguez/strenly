import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

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
      toast.success('Programa duplicado exitosamente')
    },
    onError: (error) => {
      const message = error?.message ?? 'Error al duplicar el programa'
      toast.error(message)
    },
  })
}
