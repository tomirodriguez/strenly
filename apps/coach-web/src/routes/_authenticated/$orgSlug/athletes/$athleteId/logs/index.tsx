/**
 * Log History Route
 *
 * Displays workout log history for an athlete.
 * URL: /$orgSlug/athletes/:athleteId/logs
 */

import { createFileRoute, type ErrorComponentProps } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogHistoryView } from '@/features/workout-logs/views/log-history-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/athletes/$athleteId/logs/')({
  component: LogHistoryPage,
  pendingComponent: PendingComponent,
  errorComponent: LogHistoryErrorComponent,
})

function LogHistoryPage() {
  const { athleteId } = Route.useParams()
  return <LogHistoryView athleteId={athleteId} />
}

function PendingComponent() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
}

function LogHistoryErrorComponent({ reset }: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <p className="text-destructive">Algo salio mal</p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  )
}
