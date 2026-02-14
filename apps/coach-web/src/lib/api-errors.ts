import { ORPCError } from '@orpc/client'
import { toast } from '@/lib/toast'

interface HandleMutationErrorOptions {
  /** Fallback message when error is not a recognized oRPC error */
  fallbackMessage?: string
  /** Custom handler for UNAUTHORIZED errors (overrides default redirect) */
  onUnauthorized?: () => void
}

/**
 * Centralized mutation error handler.
 *
 * - UNAUTHORIZED -> Shows "Sesion expirada" toast and redirects to /login
 * - Other ORPCError -> Shows the error.message from the procedure
 * - Unknown errors -> Shows the fallback message
 */
export function handleMutationError(error: unknown, options: HandleMutationErrorOptions = {}): void {
  const { fallbackMessage = 'Ocurrio un error inesperado', onUnauthorized } = options

  if (error instanceof ORPCError) {
    if (error.code === 'UNAUTHORIZED') {
      toast.error('Sesion expirada')
      if (onUnauthorized) {
        onUnauthorized()
      } else {
        window.location.href = '/login'
      }
      return
    }

    // Show the error message from the procedure definition
    toast.error(error.message)
    return
  }

  // Unknown error - show fallback
  toast.error(fallbackMessage)
}
