import { usePendingWorkouts } from '../hooks/queries/use-pending-workouts'
import { PendingWorkoutsTable } from '../components/pending-workouts-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardList } from 'lucide-react'

export function LoggingDashboardView() {
  const { data, isLoading, error } = usePendingWorkouts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registro de Entrenamientos</h1>
        <p className="text-muted-foreground">Entrenamientos pendientes de registrar</p>
      </div>

      {/* Pending workouts card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Entrenamientos Pendientes
          </CardTitle>
          <CardDescription>Sesiones que no tienen registro completado</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Error al cargar entrenamientos pendientes
            </div>
          ) : data && data.items.length > 0 ? (
            <PendingWorkoutsTable items={data.items} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay entrenamientos pendientes</p>
              <p className="text-sm">Todos los atletas tienen sus sesiones al dia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
