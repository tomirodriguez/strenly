import { Link } from '@tanstack/react-router'
import { Dumbbell, Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrgSlug } from '@/hooks/use-org-slug'
import { cn } from '@/lib/utils'

/**
 * Quick actions component for the dashboard.
 * Provides shortcuts to frequently used features.
 */
export function QuickActions() {
  const orgSlug = useOrgSlug()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones rapidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link
          to="/$orgSlug/athletes"
          params={{ orgSlug }}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start')}
        >
          <Users className="mr-2 h-4 w-4" />
          Gestionar atletas
        </Link>
        <Link
          to="/$orgSlug/exercises"
          params={{ orgSlug }}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start')}
        >
          <Dumbbell className="mr-2 h-4 w-4" />
          Explorar ejercicios
        </Link>
      </CardContent>
    </Card>
  )
}
