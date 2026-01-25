import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

/**
 * Hook to archive a program.
 * Invalidates programs list cache on success.
 * @returns Mutation result with archiveProgram function
 */
export function useArchiveProgram() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.programs.archive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.programs.key() })
      toast.success('Programa archivado exitosamente')
    },
    onError: (error) => {
      const message = error?.message ?? 'Error al archivar el programa'
      toast.error(message)
    },
  })
}
