import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

/**
 * Hook to create a new athlete.
 * Invalidates athlete list cache on success.
 * @returns Mutation result with createAthlete function
 */
export function useCreateAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.athletes.key() })
      toast.success('Athlete created successfully')
    },
    onError: (error) => {
      const message = error?.message ?? 'Failed to create athlete'
      toast.error(message)
    },
  })
}
