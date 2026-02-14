import { useCallback, useRef } from 'react'
import { useCreateLog } from '@/features/workout-logs/hooks/mutations/use-create-log'
import { useLogBySession } from '@/features/workout-logs/hooks/queries/use-log-by-session'
import { useWorkoutLog } from '@/features/workout-logs/hooks/queries/use-workout-log'
import { useLogActions } from '@/stores/log-store'

interface UseLogInitializationParams {
  logId?: string
  athleteId: string
  sessionId: string
  programId: string
  weekId: string
}

/**
 * Handles the get-or-create initialization logic for workout logs.
 *
 * Two flows:
 * 1. Direct navigation with logId → fetches the log and initializes the store
 * 2. No logId → checks if log exists by session, creates one if not, then initializes
 *
 * Returns loading/error state for the view to render.
 */
export function useLogInitialization({ logId, athleteId, sessionId, programId, weekId }: UseLogInitializationParams) {
  const actions = useLogActions()
  const createLogMutation = useCreateLog()

  // Track if we've initialized to prevent re-initialization
  const hasInitialized = useRef(false)
  const hasTriggeredCreate = useRef(false)

  // Fetch existing log if logId is provided (direct navigation to known log)
  const {
    data: existingLogById,
    isLoading: existingLogByIdLoading,
    error: existingLogByIdError,
  } = useWorkoutLog(logId ?? '')

  // Check if log already exists by athlete/session/week (for get-or-create flow)
  const {
    data: existingLogBySession,
    isLoading: existingLogBySessionLoading,
    isSuccess: existingLogBySessionSuccess,
  } = useLogBySession({ athleteId, sessionId, weekId })

  // Initialize store from fetched or created log data
  // Called when data becomes available from queries
  if (!hasInitialized.current) {
    // Case 1: Direct navigation with logId - use the fetched log
    if (logId && existingLogById) {
      hasInitialized.current = true
      actions.initialize(existingLogById)
    }

    // Case 2: No logId - implement get-or-create logic
    if (!logId && existingLogBySessionSuccess) {
      if (existingLogBySession) {
        // Log exists for this athlete/session/week
        hasInitialized.current = true
        actions.initialize(existingLogBySession)
      } else if (!hasTriggeredCreate.current) {
        // No log exists, create one
        hasTriggeredCreate.current = true
        createLogMutation.mutate(
          { athleteId, programId, sessionId, weekId },
          {
            onSuccess: (data) => {
              hasInitialized.current = true
              actions.initialize(data)
            },
          },
        )
      }
    }
  }

  // Reset refs on cleanup (called by the view's cleanup effect)
  const resetInitialization = useCallback(() => {
    hasInitialized.current = false
    hasTriggeredCreate.current = false
  }, [])

  const isLoading = logId ? existingLogByIdLoading : existingLogBySessionLoading || createLogMutation.isPending

  return {
    isLoading,
    existingLogByIdError,
    createError: createLogMutation.error,
    resetInitialization,
  }
}
