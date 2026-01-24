import { Mail, UserCheck, Users } from 'lucide-react'
import type { DashboardStats } from '../hooks/use-dashboard-stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardsProps {
  stats: DashboardStats
  isLoading: boolean
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  description: string
  isLoading: boolean
}

function StatCard({ icon: Icon, label, value, description, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-medium text-muted-foreground text-sm">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="mb-2 h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="font-bold text-2xl">{value}</div>
            <p className="text-muted-foreground text-xs">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Dashboard stats cards component.
 * Displays total athletes, active athletes, and pending invitations in a responsive grid.
 */
export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={Users}
        label="Total de atletas"
        value={stats.totalAthletes}
        description="en tu organizacion"
        isLoading={isLoading}
      />
      <StatCard
        icon={UserCheck}
        label="Atletas activos"
        value={stats.activeAthletes}
        description="entrenando actualmente"
        isLoading={isLoading}
      />
      <StatCard
        icon={Mail}
        label="Invitaciones pendientes"
        value={stats.pendingInvitations}
        description="esperando aceptacion"
        isLoading={isLoading}
      />
    </div>
  )
}
