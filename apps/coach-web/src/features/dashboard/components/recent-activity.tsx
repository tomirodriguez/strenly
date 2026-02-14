import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'
import { useOrgSlug } from '@/hooks/use-org-slug'

/**
 * Recent activity component for the dashboard.
 * Shows the last 5 athletes that were added to the organization.
 */
export function RecentActivity() {
  const { data, isLoading } = useAthletes({ limit: 5 })
  const orgSlug = useOrgSlug()

  const athletes = data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atletas recientes</CardTitle>
          <Link to="/$orgSlug/athletes" params={{ orgSlug }} className="text-muted-foreground text-sm hover:underline">
            Ver todos
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : athletes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aun no hay atletas</p>
        ) : (
          <div className="space-y-4">
            {athletes.map((athlete) => (
              <div key={athlete.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{athlete.name}</p>
                  <p className="text-muted-foreground text-sm">
                    Agregado hace {formatDistanceToNow(new Date(athlete.createdAt))}
                  </p>
                </div>
                <Badge variant={athlete.status === 'active' ? 'default' : 'secondary'}>
                  {athlete.status === 'active' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
