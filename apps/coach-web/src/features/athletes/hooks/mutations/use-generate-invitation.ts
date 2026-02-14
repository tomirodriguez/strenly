import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

/**
 * Hook to generate an invitation link for an athlete.
 * Invalidates athlete queries on success.
 * @returns Mutation result with generateInvitation function
 */
export function useGenerateInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.generateInvitation.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al generar la invitacion' })
    },
  })
}
