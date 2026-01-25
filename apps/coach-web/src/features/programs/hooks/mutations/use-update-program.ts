import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

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
        queryKey: orpc.programs.get.queryOptions({ input: { programId: variables.programId } }).queryKey,
      })
    },
    onError: (error) => {
      const message = error?.message ?? 'Error al actualizar el programa'
      toast.error(message)
    },
  })
}
