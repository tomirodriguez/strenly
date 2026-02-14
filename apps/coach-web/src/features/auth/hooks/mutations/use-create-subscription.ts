import { useMutation } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'
import { handleMutationError } from '@/lib/api-errors'

export function useCreateSubscription() {
  return useMutation({
    ...orpc.subscriptions.createSubscription.mutationOptions(),
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error al crear la suscripcion' })
    },
  })
}
