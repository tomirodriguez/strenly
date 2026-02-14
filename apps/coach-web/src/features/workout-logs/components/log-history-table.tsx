/**
 * Log History Table
 *
 * Displays workout logs in a table format with view, edit, and delete actions.
 * Shows date, session, status, and RPE for each log.
 */

import type { WorkoutLogAggregate } from '@strenly/contracts/workout-logs'
import { useNavigate, useParams } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Eye, MoreVertical, Trash } from 'lucide-react'
import { useDeleteLog } from '../hooks/mutations/use-delete-log'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/lib/toast'

interface LogHistoryTableProps {
  items: WorkoutLogAggregate[]
  onViewLog: (log: WorkoutLogAggregate) => void
}

const statusLabels: Record<
  'completed' | 'partial' | 'skipped',
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  completed: { label: 'Completado', variant: 'default' },
  partial: { label: 'Parcial', variant: 'secondary' },
  skipped: { label: 'Saltado', variant: 'outline' },
}

export function LogHistoryTable({ items, onViewLog }: LogHistoryTableProps) {
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

  const handleDelete = (logId: string) => {
    if (confirm('Estas seguro de eliminar este registro?')) {
      deleteLogMutation.mutate(
        { logId },
        {
          onSuccess: () => {
            toast.success('Workout eliminado')
          },
        },
      )
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Sesion</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>RPE</TableHead>
          <TableHead className="w-[80px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((log) => {
          const status = statusLabels[log.status]
          return (
            <TableRow key={log.id}>
              <TableCell>{format(new Date(log.logDate), 'PPP', { locale: es })}</TableCell>
              <TableCell>
                {/* TODO: Get session name from program */}
                Sesion
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell>{log.sessionRpe ?? '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewLog(log)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(log)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(log.id)} variant="destructive">
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
