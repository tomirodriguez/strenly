import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

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
      toast.success('Programa creado exitosamente')
    },
    onError: (error) => {
      const message = error?.message ?? 'Error al crear el programa'
      toast.error(message)
    },
  })
}
