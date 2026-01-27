/**
 * Log History View
 *
 * Displays paginated workout log history for an athlete.
 * Shows date, status, RPE, and actions (view, edit, delete).
 */

import { useState } from 'react'
import { useAthleteLogs } from '../hooks/queries/use-athlete-logs'
import { LogHistoryTable } from '../components/log-history-table'
import { LogDetailModal } from '../components/log-detail-modal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { History } from 'lucide-react'
import type { WorkoutLogAggregate } from '@strenly/contracts/workout-logs'

interface LogHistoryViewProps {
  athleteId: string
}

export function LogHistoryView({ athleteId }: LogHistoryViewProps) {
  const [selectedLog, setSelectedLog] = useState<WorkoutLogAggregate | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 20

  const { data, isLoading, error } = useAthleteLogs({
    athleteId,
    limit: pageSize,
    offset: page * pageSize,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historial de Entrenamientos</h1>
        <p className="text-muted-foreground">
          Registros de entrenamientos pasados
        </p>
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Registros
          </CardTitle>
          <CardDescription>
            {data?.totalCount ?? 0} registros en total
          </CardDescription>
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
              Error al cargar historial
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <LogHistoryTable
                items={data.items}
                onViewLog={setSelectedLog}
              />
              {/* Pagination */}
              {data.totalCount > pageSize && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1">
                    Pagina {page + 1} de {Math.ceil(data.totalCount / pageSize)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={(page + 1) * pageSize >= data.totalCount}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay registros</p>
              <p className="text-sm">
                Los entrenamientos registrados apareceran aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail modal */}
      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  )
}
