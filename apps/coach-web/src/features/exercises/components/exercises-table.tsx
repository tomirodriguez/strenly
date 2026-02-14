import type { Exercise } from '@strenly/contracts/exercises/exercise'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import type React from 'react'
import { MuscleBadges } from './muscle-badges'
import { createDataTableColumns } from '@/components/data-table/create-data-table-columns'
import { DataTable, type ErrorConfig } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'

type ExercisesTableProps = {
  data: Exercise[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  error?: ErrorConfig | null
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  children?: React.ReactNode
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const columns = createDataTableColumns<Exercise>((helper) => [
  helper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    enableSorting: true,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  }),
  helper.display({
    id: 'muscles',
    header: 'Musculos',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <MuscleBadges muscles={row.original.primaryMuscles} variant="primary" />
        <MuscleBadges muscles={row.original.secondaryMuscles} variant="secondary" />
      </div>
    ),
  }),
  helper.accessor('movementPattern', {
    header: 'Patron',
    cell: ({ row }) =>
      row.original.movementPattern ? (
        capitalize(row.original.movementPattern)
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  }),
  helper.display({
    id: 'type',
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge variant={row.original.isCurated ? 'default' : 'secondary'}>
        {row.original.isCurated ? 'Curado' : 'Personalizado'}
      </Badge>
    ),
  }),
])

/**
 * Table component for displaying exercises with pagination
 */
export function ExercisesTable({
  data,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  isLoading,
  error,
  sorting,
  onSortingChange,
  children,
}: ExercisesTableProps) {
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
      {children}
      <DataTable.Content
        emptyState={{
          title: 'No se encontraron ejercicios',
          description: 'Intenta ajustar los filtros de busqueda.',
        }}
      />
      <DataTable.Pagination />
    </DataTable.Root>
  )
}
