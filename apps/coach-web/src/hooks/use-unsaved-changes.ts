import { useBlocker } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'

/**
 * Hook to warn about unsaved changes on navigation
 * Uses TanStack Router's useBlocker for in-app navigation
 * and beforeunload for browser navigation
 */
export function useUnsavedChanges(isDirty: boolean, message?: string) {
  const defaultMessage = 'Tienes cambios sin guardar. Estas seguro de que quieres salir?'
  const warningMessage = message ?? defaultMessage

  // Block in-app navigation with TanStack Router
  const { proceed, reset, status } = useBlocker({
    condition: isDirty,
  })

  // Block browser navigation (refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = warningMessage
        return warningMessage
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, warningMessage])

  // Confirmation dialog handler
  const confirmNavigation = useCallback(() => {
    if (status === 'blocked') {
      const confirmed = window.confirm(warningMessage)
      if (confirmed) {
        proceed()
      } else {
        reset()
      }
    }
  }, [status, warningMessage, proceed, reset])

  // Auto-show confirmation when blocked
  useEffect(() => {
    if (status === 'blocked') {
      confirmNavigation()
    }
  }, [status, confirmNavigation])

  return {
    isBlocked: status === 'blocked',
    proceed,
    reset,
  }
}
