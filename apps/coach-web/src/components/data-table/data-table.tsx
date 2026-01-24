import { type ColumnDef, flexRender, getCoreRowModel, type PaginationState, useReactTable } from '@tanstack/react-table'
import { createContext, type ReactNode, useContext } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type DataTableContextValue<TData> = {
  table: ReturnType<typeof useReactTable<TData>>
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
}

const DataTableContext = createContext<DataTableContextValue<unknown> | null>(null)

function useDataTableContext<TData>() {
  const context = useContext(DataTableContext)
  if (!context) {
    throw new Error('DataTable components must be used within DataTable.Root')
  }
  return context as DataTableContextValue<TData>
}

type DataTableRootProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  totalCount: number
  pageIndex: number
  pageSize: number
  onPageChange: (pageIndex: number, pageSize: number) => void
  isLoading?: boolean
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
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater(pagination)
        onPageChange(newPagination.pageIndex, newPagination.pageSize)
      }
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const contextValue: DataTableContextValue<TData> = {
    table,
    totalCount,
    pageIndex,
    pageSize,
    onPageChange,
    isLoading,
  }

  return (
    <DataTableContext.Provider value={contextValue as DataTableContextValue<unknown>}>
      {children}
    </DataTableContext.Provider>
  )
}

function DataTableContent<TData>() {
  const { table, isLoading } = useDataTableContext<TData>()

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
            <TableRow>
              <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-muted-foreground">
                No results found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
            <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
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
