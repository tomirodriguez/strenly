/**
 * Log History View
 *
 * Displays paginated workout log history for an athlete.
 * Delegates loading, error, empty, and pagination states to LogHistoryTable (DataTable).
 */

import type { WorkoutLogAggregate } from '@strenly/contracts/workout-logs/workout-log'
import type { SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import { LogDetailModal } from '../components/log-detail-modal'
import { LogHistoryTable } from '../components/log-history-table'
import { useAthleteLogs } from '../hooks/queries/use-athlete-logs'

type LogHistoryViewProps = {
  athleteId: string
}

export function LogHistoryView({ athleteId }: LogHistoryViewProps) {
  const [selectedLog, setSelectedLog] = useState<WorkoutLogAggregate | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, isLoading, error, refetch } = useAthleteLogs({
    athleteId,
    limit: pageSize,
    offset: pageIndex * pageSize,
  })

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Historial de Entrenamientos</h1>
        <p className="text-muted-foreground">Registros de entrenamientos pasados</p>
      </div>

      <LogHistoryTable
        data={data?.items ?? []}
        totalCount={data?.totalCount ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? { message: 'Error al cargar historial', retry: refetch } : null}
        sorting={sorting}
        onSortingChange={setSorting}
        onViewLog={setSelectedLog}
      />

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
