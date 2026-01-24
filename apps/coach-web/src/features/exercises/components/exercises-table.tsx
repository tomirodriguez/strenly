import type { Exercise } from '@strenly/contracts/exercises/exercise'
import type { ColumnDef } from '@tanstack/react-table'
import type React from 'react'
import { MuscleBadges } from './muscle-badges'
import { DataTable } from '@/components/data-table/data-table'
import { Badge } from '@/components/ui/badge'

type ExercisesTableProps = {
  data: Exercise[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  children?: React.ReactNode
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const columns: ColumnDef<Exercise>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: 'muscles',
    header: 'Musculos',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <MuscleBadges muscles={row.original.primaryMuscles} variant="primary" />
        <MuscleBadges muscles={row.original.secondaryMuscles} variant="secondary" />
      </div>
    ),
  },
  {
    accessorKey: 'movementPattern',
    header: 'Patron',
    cell: ({ row }) =>
      row.original.movementPattern ? (
        capitalize(row.original.movementPattern)
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    id: 'type',
    header: 'Tipo',
    cell: ({ row }) => (
      <Badge variant={row.original.isCurated ? 'default' : 'secondary'}>
        {row.original.isCurated ? 'Curado' : 'Personalizado'}
      </Badge>
    ),
  },
]

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
    >
      <DataTable.Content />
      {children}
    </DataTable.Root>
  )
}
