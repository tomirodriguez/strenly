import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import type React from 'react'
import { useMemo } from 'react'
import { createProgramsColumns, type ProgramRow } from './programs-table-columns'
import { DataTable, type EmptyStateConfig, type ErrorConfig } from '@/components/data-table/data-table'

type ProgramsTableProps = {
  data: ProgramRow[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  error?: ErrorConfig | null
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  emptyState?: EmptyStateConfig
  onEdit: (program: ProgramRow) => void
  onDuplicate: (program: ProgramRow) => void
  onArchive: (program: ProgramRow) => void
  children?: React.ReactNode
}

/**
 * Programs table component with pagination and row actions.
 * Uses DataTable compound component for consistent table styling.
 */
export function ProgramsTable({
  data,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  isLoading = false,
  error,
  sorting,
  onSortingChange,
  emptyState,
  onEdit,
  onDuplicate,
  onArchive,
  children,
}: ProgramsTableProps) {
  const columns = useMemo(
    () => createProgramsColumns({ onEdit, onDuplicate, onArchive }),
    [onEdit, onDuplicate, onArchive],
  )

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
        emptyState={
          emptyState ?? {
            title: 'No se encontraron programas',
            description: 'Intenta ajustar los filtros o crear un nuevo programa.',
          }
        }
      />
      <DataTable.Pagination />
    </DataTable.Root>
  )
}
