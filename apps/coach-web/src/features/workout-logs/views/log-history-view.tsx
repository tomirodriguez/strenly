/**
 * Log History View
 *
 * Displays paginated workout log history for an athlete.
 * Shows date, status, RPE, and actions (view, edit, delete).
 */

import type { WorkoutLogAggregate } from '@strenly/contracts/workout-logs'
import { History } from 'lucide-react'
import { useState } from 'react'
import { LogDetailModal } from '../components/log-detail-modal'
import { LogHistoryTable } from '../components/log-history-table'
import { useAthleteLogs } from '../hooks/queries/use-athlete-logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

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
        <h1 className="font-bold text-2xl tracking-tight">Historial de Entrenamientos</h1>
        <p className="text-muted-foreground">Registros de entrenamientos pasados</p>
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Registros
          </CardTitle>
          <CardDescription>{data?.totalCount ?? 0} registros en total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-muted-foreground">Error al cargar historial</div>
          ) : data && data.items.length > 0 ? (
            <>
              <LogHistoryTable items={data.items} onViewLog={setSelectedLog} />
              {/* Pagination */}
              {data.totalCount > pageSize && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded border px-3 py-1 disabled:opacity-50"
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
                    className="rounded border px-3 py-1 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No hay registros</p>
              <p className="text-sm">Los entrenamientos registrados apareceran aqui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail modal */}
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
