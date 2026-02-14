/**
 * Log History Table
 *
 * Displays workout logs using DataTable compound component with
 * pagination, loading/error/empty states, and row actions.
 */

import type { WorkoutLogAggregate } from '@strenly/contracts/workout-logs/workout-log'
import { useNavigate, useParams } from '@tanstack/react-router'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Eye, History, Trash } from 'lucide-react'
import { useMemo } from 'react'
import { useDeleteLog } from '../hooks/mutations/use-delete-log'
import { createDataTableColumns } from '@/components/data-table/create-data-table-columns'
import { DataTable, type ErrorConfig } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/lib/toast'

const STATUS_LABELS: Record<
  'completed' | 'partial' | 'skipped',
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  completed: { label: 'Completado', variant: 'default' },
  partial: { label: 'Parcial', variant: 'secondary' },
  skipped: { label: 'Saltado', variant: 'outline' },
}

type UseLogColumnsOptions = {
  onViewLog: (log: WorkoutLogAggregate) => void
  onEdit: (log: WorkoutLogAggregate) => void
  onDelete: (log: WorkoutLogAggregate) => void
}

function useLogColumns({ onViewLog, onEdit, onDelete }: UseLogColumnsOptions) {
  return useMemo(
    () =>
      createDataTableColumns<WorkoutLogAggregate>((helper) => [
        helper.accessor('logDate', {
          header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha" />,
          enableSorting: true,
          sortDescFirst: true,
          cell: ({ row }) => format(new Date(row.original.logDate), 'PPP', { locale: es }),
        }),
        helper.display({
          id: 'sessionName',
          header: 'Sesion',
          cell: ({ row }) => <span className="text-muted-foreground">{row.original.sessionName ?? 'Sesion'}</span>,
        }),
        helper.accessor('status', {
          header: 'Estado',
          cell: ({ row }) => {
            const status = STATUS_LABELS[row.original.status]
            return <Badge variant={status.variant}>{status.label}</Badge>
          },
        }),
        helper.accessor('sessionRpe', {
          header: 'RPE',
          cell: ({ row }) => row.original.sessionRpe ?? '-',
        }),
        helper.actions({
          actions: (log) => [
            { label: 'Ver detalles', icon: Eye, onClick: () => onViewLog(log) },
            { label: 'Editar', icon: Edit, onClick: () => onEdit(log) },
            { label: 'Eliminar', icon: Trash, onClick: () => onDelete(log), variant: 'destructive' },
          ],
        }),
      ]),
    [onViewLog, onEdit, onDelete],
  )
}

type LogHistoryTableProps = {
  data: WorkoutLogAggregate[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  error?: ErrorConfig | null
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onViewLog: (log: WorkoutLogAggregate) => void
}

export function LogHistoryTable({
  data,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  isLoading,
  error,
  sorting,
  onSortingChange,
  onViewLog,
}: LogHistoryTableProps) {
  const { orgSlug, athleteId } = useParams({
    from: '/_authenticated/$orgSlug/athletes/$athleteId/logs/',
  })
  const navigate = useNavigate()
  const deleteLogMutation = useDeleteLog()

  const handleEdit = (log: WorkoutLogAggregate) => {
    navigate({
      to: '/$orgSlug/athletes/$athleteId/log/$sessionId',
      params: {
        orgSlug,
        athleteId,
        sessionId: log.sessionId,
      },
      search: {
        programId: log.programId,
        weekId: log.weekId,
        logId: log.id,
      },
    })
  }

  const handleDelete = (log: WorkoutLogAggregate) => {
    if (confirm('Estas seguro de eliminar este registro?')) {
      deleteLogMutation.mutate(
        { logId: log.id },
        {
          onSuccess: () => {
            toast.success('Workout eliminado')
          },
        },
      )
    }
  }

  const columns = useLogColumns({ onViewLog, onEdit: handleEdit, onDelete: handleDelete })

  return (
    <DataTable.Root
      columns={columns}
      data={data}
      totalCount={totalCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onPageChange}
      isLoading={isLoading}
      error={error}
      sorting={sorting}
      onSortingChange={onSortingChange}
    >
      <DataTable.Content
        emptyState={{
          icon: <History className="h-12 w-12" />,
          title: 'No hay registros',
          description: 'Los entrenamientos registrados apareceran aqui',
        }}
      />
      <DataTable.Pagination />
    </DataTable.Root>
  )
}
