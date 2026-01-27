/**
 * Log History Route
 *
 * Displays workout log history for an athlete.
 * URL: /$orgSlug/athletes/:athleteId/logs
 */

import { createFileRoute } from '@tanstack/react-router'
import { LogHistoryView } from '@/features/workout-logs/views/log-history-view'

export const Route = createFileRoute(
  '/_authenticated/$orgSlug/athletes/$athleteId/logs/'
)({
  component: LogHistoryPage,
})

function LogHistoryPage() {
  const { athleteId } = Route.useParams()
  return <LogHistoryView athleteId={athleteId} />
}
