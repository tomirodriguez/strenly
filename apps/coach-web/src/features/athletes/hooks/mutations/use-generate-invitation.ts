import { useMutation, useQueryClient } from '@tanstack/react-query'
import { athleteKeys } from '../queries/use-athletes'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

/**
 * Hook to generate an invitation link for an athlete.
 * Copies the invitation URL to clipboard on success.
 * @returns Mutation result with generateInvitation function
 */
export function useGenerateInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.generateInvitation.mutationOptions(),
    onSuccess: async (data) => {
      try {
        await navigator.clipboard.writeText(data.invitationUrl)
        queryClient.invalidateQueries({ queryKey: athleteKeys.all })
        toast.success('Invitation link copied to clipboard!')
      } catch (_error) {
        toast.error('Failed to copy invitation link')
      }
    },
    onError: (error) => {
      const message = error?.message ?? 'Failed to generate invitation'
      toast.error(message)
    },
  })
}
