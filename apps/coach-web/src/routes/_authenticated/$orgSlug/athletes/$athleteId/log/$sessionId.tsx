/**
 * Session Logging Route
 *
 * Route for logging a workout session for an athlete.
 * URL: /athletes/:athleteId/log/:sessionId?programId=...&weekId=...&logId=...
 *
 * Creates a new log from prescription or loads an existing one for editing.
 */

import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SessionLoggingView } from '@/features/workout-logs/views/session-logging-view'

const searchSchema = z.object({
  programId: z.string(),
  weekId: z.string(),
  logId: z.string().optional(), // If provided, load existing log
})

export const Route = createFileRoute('/_authenticated/$orgSlug/athletes/$athleteId/log/$sessionId')({
  validateSearch: searchSchema,
  component: SessionLoggingViewRoute,
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
