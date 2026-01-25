import type { Athlete } from '@strenly/contracts/athletes/athlete'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Edit, Mail, Trash } from 'lucide-react'
import { InvitationStatus } from './invitation-status'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableRowActions, type RowAction } from '@/components/data-table/data-table-row-actions'
import { Badge } from '@/components/ui/badge'

type AthletesTableProps = {
  data: Athlete[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  onEdit: (athlete: Athlete) => void
  onArchive: (athlete: Athlete) => void
  onInvitation: (athlete: Athlete) => void
}

/**
 * Athletes table component with pagination and row actions.
 * Displays athlete information including name, email, status, and invitation status.
 */
export function AthletesTable({
  data,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  isLoading = false,
  onEdit,
  onArchive,
  onInvitation,
}: AthletesTableProps) {
  const columns: ColumnDef<Athlete>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Correo',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email ?? '-'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === 'active' ? 'secondary' : 'outline'}>
            {status === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        )
      },
    },
    {
      id: 'invitation',
      header: 'Invitacion',
      cell: ({ row }) => <InvitationStatus athlete={row.original} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Creado',
      cell: ({ row }) => {
        const createdAt = new Date(row.original.createdAt)
        return (
          <span className="text-muted-foreground text-sm">{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const actions: RowAction<Athlete>[] = [
          {
            label: 'Editar',
            icon: Edit,
            onClick: onEdit,
          },
          {
            label: 'Invitacion',
            icon: Mail,
            onClick: onInvitation,
          },
          {
            label: 'Archivar',
            icon: Trash,
            onClick: onArchive,
            variant: 'destructive',
          },
        ]

        return <DataTableRowActions row={row.original} actions={actions} />
      },
    },
  ]

  return (
    <DataTable.Root
      columns={columns}
      data={data}
      totalCount={totalCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={onPageChange}
      isLoading={isLoading}
    >
      <DataTable.Content />
    </DataTable.Root>
  )
}
