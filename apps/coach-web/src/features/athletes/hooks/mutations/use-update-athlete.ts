import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

/**
 * Hook to update an existing athlete.
 * Invalidates athlete list and detail cache on success.
 * @returns Mutation result with updateAthlete function
 */
export function useUpdateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
      toast.success('Athlete updated successfully')
    },
    onError: (error) => {
      const message = error?.message ?? 'Failed to update athlete'
      toast.error(message)
    },
  })
}
