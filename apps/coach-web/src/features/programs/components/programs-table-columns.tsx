import type { Program } from '@strenly/contracts/programs/program'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Archive, Copy, Edit } from 'lucide-react'
import { DataTableRowActions, type RowAction } from '@/components/data-table/data-table-row-actions'
import { Badge } from '@/components/ui/badge'

/**
 * Extended Program type with resolved athlete name for table display.
 */
export type ProgramRow = Program & {
  athleteName?: string
  weeksCount?: number
}

const STATUS_LABELS: Record<Program['status'], string> = {
  draft: 'Borrador',
  active: 'Activo',
  archived: 'Archivado',
}

const STATUS_VARIANTS: Record<Program['status'], 'secondary' | 'default' | 'outline'> = {
  draft: 'secondary',
  active: 'default',
  archived: 'outline',
}

type ProgramsColumnsCallbacks = {
  onEdit: (program: ProgramRow) => void
  onDuplicate: (program: ProgramRow) => void
  onArchive: (program: ProgramRow) => void
}

/**
 * Creates column definitions for the programs table.
 * Includes: name, status, athlete, weeks, isTemplate, updatedAt, actions.
 */
export function createProgramsColumns(callbacks: ProgramsColumnsCallbacks): ColumnDef<ProgramRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status
        return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
      },
    },
    {
      id: 'athleteName',
      header: 'Atleta',
      cell: ({ row }) => {
        const athleteName = row.original.athleteName
        return <span className="text-muted-foreground">{athleteName ?? 'Sin atleta'}</span>
      },
    },
    {
      id: 'weeksCount',
      header: 'Semanas',
      cell: ({ row }) => {
        const count = row.original.weeksCount ?? 0
        return (
          <span className="text-muted-foreground">
            {count} {count === 1 ? 'semana' : 'semanas'}
          </span>
        )
      },
    },
    {
      accessorKey: 'isTemplate',
      header: 'Tipo',
      cell: ({ row }) => {
        const isTemplate = row.original.isTemplate
        if (isTemplate) {
          return <Badge variant="outline">Plantilla</Badge>
        }
        return <span className="text-muted-foreground">Programa</span>
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Actualizado',
      cell: ({ row }) => {
        const updatedAt = new Date(row.original.updatedAt)
        return (
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(updatedAt, { addSuffix: true, locale: es })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const program = row.original
        const actions: RowAction<ProgramRow>[] = [
          {
            label: 'Editar',
            icon: Edit,
            onClick: callbacks.onEdit,
          },
          {
            label: 'Duplicar',
            icon: Copy,
            onClick: callbacks.onDuplicate,
          },
        ]

        // Only show archive action if not already archived
        if (program.status !== 'archived') {
          actions.push({
            label: 'Archivar',
            icon: Archive,
            onClick: callbacks.onArchive,
            variant: 'destructive',
          })
        }

        return <DataTableRowActions row={program} actions={actions} />
      },
    },
  ]
}
