import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to update a program's metadata (name, description, etc.)
 * Used in the program header for inline name editing.
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.update.mutationOptions(),
    onSuccess: (_data, variables) => {
      // Invalidate both list and single program queries
      queryClient.invalidateQueries({ queryKey: orpc.programs.key() })
      queryClient.invalidateQueries({
        queryKey: orpc.programs.get.key({ input: { programId: variables.programId } }),
      })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al actualizar el programa' })
    },
  })
}
