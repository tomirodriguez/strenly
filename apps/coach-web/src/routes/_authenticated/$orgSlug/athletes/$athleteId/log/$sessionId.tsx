/**
 * Session Logging Route
 *
 * Route for logging a workout session for an athlete.
 * URL: /athletes/:athleteId/log/:sessionId?programId=...&weekId=...&logId=...
 *
 * Creates a new log from prescription or loads an existing one for editing.
 */

import { createFileRoute, type ErrorComponentProps } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { SessionLoggingView } from '@/features/workout-logs/views/session-logging-view'

const searchSchema = z.object({
  programId: z.string(),
  weekId: z.string(),
  logId: z.string().optional(), // If provided, load existing log
})

export const Route = createFileRoute('/_authenticated/$orgSlug/athletes/$athleteId/log/$sessionId')({
  validateSearch: searchSchema,
  component: SessionLoggingViewRoute,
  pendingComponent: PendingComponent,
  errorComponent: SessionLoggingErrorComponent,
})

function SessionLoggingViewRoute() {
  const { orgSlug, athleteId, sessionId } = Route.useParams()
  const { programId, weekId, logId } = Route.useSearch()

  return (
    <SessionLoggingView
      orgSlug={orgSlug}
      athleteId={athleteId}
      sessionId={sessionId}
      programId={programId}
      weekId={weekId}
      logId={logId}
    />
  )
}

function PendingComponent() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}

function SessionLoggingErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-destructive">Algo salio mal</p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  )
}
