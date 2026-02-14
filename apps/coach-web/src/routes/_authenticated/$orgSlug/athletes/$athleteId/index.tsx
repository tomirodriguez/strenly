/**
 * Athlete Detail Route
 *
 * Shows athlete information and their assigned program.
 * URL: /$orgSlug/athletes/:athleteId
 */

import { createFileRoute, type ErrorComponentProps, Link, useParams } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { AthleteDetailView } from '@/features/athletes/views/athlete-detail-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/athletes/$athleteId/')({
  component: AthleteDetailPage,
  errorComponent: AthleteErrorComponent,
})

function AthleteDetailPage() {
  const { athleteId } = Route.useParams()
  return <AthleteDetailView athleteId={athleteId} />
}

function AthleteErrorComponent({ error, reset }: ErrorComponentProps) {
  const { orgSlug } = useParams({ from: '/_authenticated/$orgSlug' })

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-4">
      <h2 className="font-bold text-xl">Error al cargar el atleta</h2>
      <p className="max-w-md text-center text-muted-foreground">
        {error instanceof Error ? error.message : 'Ocurrio un error inesperado al cargar el atleta.'}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Reintentar
        </Button>
        <Button render={<Link to="/$orgSlug/athletes" params={{ orgSlug }} />}>Volver a atletas</Button>
      </div>
    </div>
  )
}
