import { createFileRoute } from '@tanstack/react-router'
import { LoggingDashboardView } from '@/features/workout-logs/views/logging-dashboard-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/logging/')({
  component: LoggingDashboardPage,
})

function LoggingDashboardPage() {
  return <LoggingDashboardView />
}
