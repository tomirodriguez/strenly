import { QuickActions } from '../components/quick-actions'
import { RecentActivity } from '../components/recent-activity'
import { StatsCards } from '../components/stats-cards'
import { useDashboardStats } from '../hooks/use-dashboard-stats'
import { useOrganization } from '@/contexts/organization-context'

/**
 * Dashboard view component.
 * Main landing page after authentication showing organization overview.
 */
export function DashboardView() {
  const org = useOrganization()
  const { stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Bienvenido a {org.name}</h1>
        <p className="text-muted-foreground">Aqui tienes un resumen de tu organizacion</p>
      </div>

      <StatsCards stats={stats} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  )
}
