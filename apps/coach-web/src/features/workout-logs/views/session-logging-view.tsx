/**
 * Session Logging View - Redesigned
 *
 * Main view for logging a workout session. Coaches enter actual
 * workout data: reps performed, weight used, RPE.
 *
 * Features:
 * - Context header with program, week, session, athlete names
 * - Compact grid layout with prescription column
 * - Exercise groups with visual connection (A1, A2, B1...)
 * - Deviation highlighting (amber border when actual differs)
 * - Skip functionality for exercises and series
 * - Session-level RPE and notes
 * - Unsaved changes guard
 */

import type { WorkoutLogAggregate } from '@strenly/contracts/workout-logs'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { LoggingGrid } from '../components/logging-grid'
import { SessionSummaryCard } from '../components/session-summary-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useExercisesMap } from '@/features/programs/hooks/queries/use-exercises-map'
import { useCreateLog } from '@/features/workout-logs/hooks/mutations/use-create-log'
import { useSaveLog } from '@/features/workout-logs/hooks/mutations/use-save-log'
import { useLogBySession } from '@/features/workout-logs/hooks/queries/use-log-by-session'
import { useWorkoutLog } from '@/features/workout-logs/hooks/queries/use-workout-log'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { toast } from '@/lib/toast'
import { useLogActions, useLogData, useLogIsDirty } from '@/stores/log-store'

interface SessionLoggingViewProps {
  orgSlug: string
  athleteId: string
  sessionId: string
  programId: string
  weekId: string
  logId?: string
}

export function SessionLoggingView({
  orgSlug,
  athleteId,
  sessionId,
  programId,
  weekId,
  logId,
}: SessionLoggingViewProps) {
  const navigate = useNavigate()

  // Store state and actions
  const logData = useLogData()
  const isDirty = useLogIsDirty()
  const actions = useLogActions()

  // Exercises map for name lookup
  const { exercisesMap, isLoading: exercisesLoading } = useExercisesMap()

  // Create log mutation - used when no log exists
  const createLogMutation = useCreateLog()

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
  } = useLogBySession({
    athleteId,
    sessionId,
    weekId,
  })

  // Save mutation
  const saveLogMutation = useSaveLog(() => {
    toast.success('Workout guardado')
    // Navigate back to athlete detail on success
    navigate({
      to: '/$orgSlug/athletes',
      params: { orgSlug },
    })
  })

  // Track if we've initialized to prevent infinite loops
  const hasInitialized = useRef(false)
  const hasTriggeredCreate = useRef(false)

  // Initialize store with log data
  useEffect(() => {
    // Skip if already initialized
    if (hasInitialized.current) return

    // Case 1: Direct navigation with logId - use the fetched log
    if (logId && existingLogById) {
      hasInitialized.current = true
      actions.initialize(existingLogById)
      return
    }

    // Case 2: No logId - implement get-or-create logic
    if (!logId && existingLogBySessionSuccess) {
      // If log exists for this athlete/session/week, use it
      if (existingLogBySession) {
        hasInitialized.current = true
        actions.initialize(existingLogBySession)
        return
      }

      // If no log exists and we haven't started creating one, create it
      if (!hasTriggeredCreate.current) {
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
  }, [
    logId,
    existingLogById,
    existingLogBySession,
    existingLogBySessionSuccess,
    athleteId,
    programId,
    sessionId,
    weekId,
    actions,
    createLogMutation,
  ])

  // Cleanup store on unmount
  useEffect(() => {
    return () => {
      hasInitialized.current = false
      hasTriggeredCreate.current = false
      actions.reset()
    }
  }, [actions])

  // Unsaved changes guard
  useUnsavedChanges(isDirty, 'Tienes cambios sin guardar. Estas seguro de que quieres salir?')

  // Handle save
  const handleSave = useCallback(() => {
    const saveData = actions.getLogForSave()
    if (!saveData) return

    saveLogMutation.mutate(saveData)
  }, [actions, saveLogMutation])

  // Loading states
  const isLoading =
    exercisesLoading || (logId ? existingLogByIdLoading : existingLogBySessionLoading || createLogMutation.isPending)

  if (isLoading) {
    return <SessionLoggingSkeleton />
  }

  // Error states
  if (logId && existingLogByIdError) {
    return <SessionLogNotFound orgSlug={orgSlug} />
  }

  if (createLogMutation.error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Error al crear el log: {createLogMutation.error.message}</p>
        <Button variant="outline" render={<Link to="/$orgSlug/athletes" params={{ orgSlug }} />}>
          <ArrowLeftIcon className="h-4 w-4" />
          Volver
        </Button>
      </div>
    )
  }

  // Wait for store to be initialized
  if (!logData) {
    return <SessionLoggingSkeleton />
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header with context */}
      <SessionLoggingHeader
        log={logData}
        orgSlug={orgSlug}
        isDirty={isDirty}
        isPending={saveLogMutation.isPending}
        onSave={handleSave}
      />

      {/* Main content - scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 p-4">
          {/* Exercise groups grid */}
          <LoggingGrid exercises={logData.exercises} exercisesMap={exercisesMap} />

          {/* Session summary (RPE, notes) */}
          <SessionSummaryCard />
        </div>
      </div>

      {/* Footer with save button */}
      <SessionLoggingFooter isDirty={isDirty} isPending={saveLogMutation.isPending} onSave={handleSave} />
    </div>
  )
}

// ============================================================================
// Header Component - Now with context (program, week, session, athlete names)
// ============================================================================

interface SessionLoggingHeaderProps {
  log: WorkoutLogAggregate
  orgSlug: string
  isDirty: boolean
  isPending: boolean
  onSave: () => void
}

function SessionLoggingHeader({ log, orgSlug, isDirty, isPending, onSave }: SessionLoggingHeaderProps) {
  const logDate = new Date(log.logDate).toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  // Context: Program > Week > Session for Athlete
  const programName = log.programName ?? 'Programa'
  const weekName = log.weekName ?? 'Semana'
  const sessionName = log.sessionName ?? 'Sesion'
  const athleteName = log.athleteName ?? 'Atleta'

  return (
    <header className="flex shrink-0 items-center justify-between border-border border-b bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link to="/$orgSlug/athletes" params={{ orgSlug }} />}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>

        <div className="min-w-0">
          {/* Primary: Session name + Athlete */}
          <h1 className="truncate font-semibold text-sm">
            {sessionName} <span className="text-muted-foreground">- {athleteName}</span>
          </h1>

          {/* Secondary: Program > Week + Date */}
          <p className="flex items-center gap-2 text-muted-foreground text-xs">
            <span className="truncate">
              {programName} / {weekName}
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span className="capitalize">{logDate}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isDirty && <span className="text-muted-foreground text-xs">Sin guardar</span>}
        <Button size="sm" onClick={onSave} disabled={!isDirty || isPending}>
          <SaveIcon className="h-4 w-4" />
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </header>
  )
}

// ============================================================================
// Footer Component
// ============================================================================

interface SessionLoggingFooterProps {
  isDirty: boolean
  isPending: boolean
  onSave: () => void
}

function SessionLoggingFooter({ isDirty, isPending, onSave }: SessionLoggingFooterProps) {
  return (
    <footer className="flex shrink-0 items-center justify-between border-border border-t bg-background px-4 py-3">
      <div className="text-muted-foreground text-xs">
        <span className="hidden sm:inline">Los cambios son locales hasta que guardes.</span>
      </div>

      <Button size="sm" onClick={onSave} disabled={!isDirty || isPending}>
        <SaveIcon className="h-4 w-4" />
        {isPending ? 'Guardando...' : 'Guardar'}
      </Button>
    </footer>
  )
}

// ============================================================================
// Skeleton Component
// ============================================================================

function SessionLoggingSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header skeleton */}
      <div className="flex shrink-0 items-center justify-between border-border border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="mb-1 h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Content skeleton */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 p-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex shrink-0 items-center justify-between border-border border-t px-4 py-3">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

// ============================================================================
// Error Component
// ============================================================================

function SessionLogNotFound({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">No se encontro el registro de entrenamiento</p>
      <Button variant="outline" render={<Link to="/$orgSlug/athletes" params={{ orgSlug }} />}>
        <ArrowLeftIcon className="h-4 w-4" />
        Volver
      </Button>
    </div>
  )
}
