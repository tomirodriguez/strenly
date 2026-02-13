import { useMemo } from 'react'
import { createProgramsColumns, type ProgramRow } from './programs-table-columns'
import { DataTable, type ErrorConfig } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'

type ProgramsTableProps = {
  data: ProgramRow[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  error?: ErrorConfig | null
  onEdit: (program: ProgramRow) => void
  onDuplicate: (program: ProgramRow) => void
  onArchive: (program: ProgramRow) => void
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
  onEdit,
  onDuplicate,
  onArchive,
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
    >
      <DataTable.Content
        emptyState={{
          title: 'No se encontraron programas',
          description: 'Intenta ajustar los filtros o crear un nuevo programa.',
        }}
      />
      <DataTablePagination />
    </DataTable.Root>
  )
}
