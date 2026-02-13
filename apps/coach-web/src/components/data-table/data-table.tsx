import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { AlertCircle } from 'lucide-react'
import { createContext, type ReactNode, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type ErrorConfig = {
  message: string
  retry?: () => void
}

type EmptyStateConfig = {
  title?: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

type DataTableContextValue<TData> = {
  table: ReturnType<typeof useReactTable<TData>>
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  error?: ErrorConfig | null
}

// biome-ignore lint/suspicious/noExplicitAny: React generic contexts require any for type erasure
const DataTableContext = createContext<DataTableContextValue<any> | null>(null)

function useDataTableContext<TData>(): DataTableContextValue<TData> {
  const context = useContext(DataTableContext)
  if (!context) {
    throw new Error('DataTable components must be used within DataTable.Root')
  }
  return context
}

type DataTableRootProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
  error?: ErrorConfig | null
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  children?: ReactNode
}

function DataTableRoot<TData>({
  columns,
  data,
  totalCount,
  pageIndex,
  pageSize,
  onPageChange,
  isLoading = false,
  error,
  sorting,
  onSortingChange,
  children,
}: DataTableRootProps<TData>) {
  const pagination: PaginationState = {
    pageIndex,
    pageSize,
  }

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination,
      ...(sorting !== undefined ? { sorting } : {}),
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater(pagination)
        onPageChange(newPagination.pageIndex, newPagination.pageSize)
      }
    },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: onSortingChange ? getSortedRowModel() : undefined,
    manualPagination: true,
    manualSorting: onSortingChange !== undefined,
  })

  const contextValue: DataTableContextValue<TData> = {
    table,
    totalCount,
    pageIndex,
    pageSize,
    onPageChange,
    isLoading,
    error,
  }

  return <DataTableContext.Provider value={contextValue}>{children}</DataTableContext.Provider>
}

type DataTableContentProps<TData> = {
  onRowClick?: (row: TData) => void
  emptyState?: EmptyStateConfig
}

function DataTableContent<TData>({ onRowClick, emptyState }: DataTableContentProps<TData> = {}) {
  const { table, isLoading, error } = useDataTableContext<TData>()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border p-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive/50" />
        <h3 className="mt-4 font-semibold text-lg">{error.message}</h3>
        {error.retry && (
          <Button variant="outline" onClick={error.retry} className="mt-4">
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, i) => `skeleton-row-${i}`).map((rowKey) => (
              <TableRow key={rowKey}>
                {table.getAllColumns().map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  const rows = table.getRowModel().rows

  if (rows.length === 0) {
    const title = emptyState?.title ?? 'No hay datos'
    const description = emptyState?.description
    const icon = emptyState?.icon
    const action = emptyState?.action

    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center">
        {icon && <div className="text-muted-foreground/50">{icon}</div>}
        <h3 className={icon ? 'mt-4 font-semibold text-lg' : 'font-semibold text-lg'}>{title}</h3>
        {description && <p className="mt-2 text-muted-foreground text-sm">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
              className={onRowClick ? 'cursor-pointer' : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export const DataTable = {
  Root: DataTableRoot,
  Content: DataTableContent,
}

export { useDataTableContext }
export type { ErrorConfig, EmptyStateConfig }
