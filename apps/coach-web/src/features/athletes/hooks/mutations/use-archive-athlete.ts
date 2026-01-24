import { useMutation, useQueryClient } from '@tanstack/react-query'
import { athleteKeys } from '../queries/use-athletes'
import { orpc } from '@/lib/api-client'
import { toast } from '@/lib/toast'

/**
 * Hook to archive an athlete (set status to inactive).
 * Invalidates athlete list cache on success.
 * @returns Mutation result with archiveAthlete function
 */
export function useArchiveAthlete() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.athletes.archive.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: athleteKeys.all })
      toast.success('Athlete archived successfully')
    },
    onError: (error) => {
      const message = error?.message ?? 'Failed to archive athlete'
      toast.error(message)
    },
  })
}
