# DataTable API Reference

Detailed prop types and interfaces for the DataTable component.

## DataTable Root Props

```tsx
interface DataTableRootProps<TData> {
  // Required
  data: TData[]                           // Data array to display
  columns: ColumnDef<TData, unknown>[]    // TanStack column definitions
  children: React.ReactNode               // Compound components

  // States
  isLoading?: boolean                     // Shows skeleton loading
  error?: ErrorConfig | null              // Shows error state

  // Row appearance
  rowHeight?: 'condensed' | 'regular' | 'relaxed'  // Default: 'condensed'

  // Pagination (server-side)
  pageCount?: number                      // Total pages for server-side pagination

  // Sorting (server-side)
  sorting?: SortingState                  // Controlled sorting state
  onSortingChange?: OnChangeFn<SortingState>

  // Row selection
  rowSelection?: RowSelectionState        // Controlled selection state
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  getRowId?: (row: TData) => string       // Custom row ID for selection
}
```

## Compound Component Props

### DataTable.Header

```tsx
interface DataTableHeaderProps {
  title?: string           // Main heading
  description?: string     // Subheading text
  children?: React.ReactNode  // Action buttons slot
}
```

### DataTable.Toolbar

```tsx
interface DataTableToolbarProps {
  children: React.ReactNode  // Search, filters, etc.
  className?: string
}
```

### DataTable.Search

```tsx
interface DataTableSearchProps {
  placeholder?: string     // Default: 'Buscar...'
  value?: string           // Controlled value
  onChange: (value: string) => void  // Debounced callback
  delay?: number           // Debounce delay in ms (default: 300)
  className?: string
}
```

### DataTable.FilterSelect

```tsx
interface DataTableFilterSelectProps {
  placeholder?: string     // Default: 'Filtrar...'
  options: FilterOption[]  // Available options
  value?: string           // Selected value
  onChange: (value: string) => void
  className?: string
}

interface FilterOption {
  label: string
  value: string
}
```

### DataTable.Content

```tsx
interface DataTableContentProps {
  onRowClick?: (row: unknown) => void  // Row click handler
  emptyState?: EmptyStateConfig        // Custom empty state
  className?: string
}

interface EmptyStateConfig {
  title?: string           // Default: 'No hay datos'
  description?: string
  action?: React.ReactNode // Button or custom action
  icon?: React.ReactNode   // Custom icon
}
```

### DataTable.Pagination

```tsx
interface DataTablePaginationProps {
  pageIndex: number              // Current page (0-based)
  pageSize: number               // Items per page
  totalCount: number             // Total items
  onPageChange: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]     // Default: [10, 20, 50]
}
```

### DataTable.ColumnHeader

```tsx
interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>  // TanStack column
  title: string                  // Display text
  className?: string
}
```

## Column Helper Methods

### helper.accessor()

Standard TanStack accessor with all regular options.

### helper.selection()

```tsx
helper.selection()  // No options, returns checkbox column
```

### helper.actions()

```tsx
helper.actions({
  id?: string,  // Default: 'actions'
  actions: (row: TData) => RowAction<TData>[]
})

interface RowAction<TData> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (row: TData) => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}
```

## Error Config

```tsx
interface ErrorConfig {
  message: string
  retry?: () => void  // Optional retry button
}
```

## Row Heights

| Variant | Height | CSS Class | Use Case |
|---------|--------|-----------|----------|
| `condensed` | 40px | `h-10` | Dense data, many rows |
| `regular` | 48px | `h-12` | Default, general use |
| `relaxed` | 56px | `h-14` | Complex cell content |

## Complete Example

```tsx
import { useState } from 'react'
import { DataTable, createDataTableColumns } from '@strenly/ui/components/data-table'
import type { SortingState, RowSelectionState } from '@tanstack/react-table'
import { PencilIcon, TrashIcon } from 'lucide-react'
import { Button } from '@strenly/ui/components/ui/button'
import { Badge } from '@strenly/ui/components/ui/badge'

interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
}

function UsersTable() {
  // State
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [selected, setSelected] = useState<RowSelectionState>({})

  // Query with server-side params
  const { data, total, isLoading, error, refetch } = useUsersQuery({
    page,
    pageSize,
    search,
    status: statusFilter,
    sortField: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
  })

  // Columns
  const columns = createDataTableColumns<User>((helper) => [
    helper.selection(),
    helper.accessor('name', {
      header: ({ column }) => (
        <DataTable.ColumnHeader column={column} title="Nombre" />
      ),
    }),
    helper.accessor('email', { header: 'Email' }),
    helper.accessor('status', {
      header: 'Estado',
      cell: ({ getValue }) => (
        <Badge variant={getValue() === 'active' ? 'default' : 'secondary'}>
          {getValue() === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    }),
    helper.actions({
      actions: (row) => [
        { label: 'Editar', icon: PencilIcon, onClick: () => handleEdit(row) },
        { label: 'Eliminar', icon: TrashIcon, onClick: () => handleDelete(row), variant: 'destructive' },
      ],
    }),
  ])

  const statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ]

  return (
    <DataTable
      data={data ?? []}
      columns={columns}
      isLoading={isLoading}
      error={error ? { message: 'Error al cargar usuarios', retry: refetch } : null}
      pageCount={Math.ceil((total ?? 0) / pageSize)}
      sorting={sorting}
      onSortingChange={setSorting}
      rowSelection={selected}
      onRowSelectionChange={setSelected}
      getRowId={(row) => row.id}
    >
      <DataTable.Header title="Usuarios" description="Gestiona los usuarios del sistema">
        <Button>Agregar Usuario</Button>
      </DataTable.Header>

      <DataTable.Toolbar>
        <DataTable.Search
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={setSearch}
        />
        <DataTable.FilterSelect
          placeholder="Estado"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </DataTable.Toolbar>

      <DataTable.Content
        onRowClick={(row) => navigate(`/users/${row.id}`)}
        emptyState={{
          title: 'No hay usuarios',
          description: 'Agrega tu primer usuario para comenzar',
          action: <Button>Crear Usuario</Button>,
        }}
      />

      <DataTable.Pagination
        pageIndex={page}
        pageSize={pageSize}
        totalCount={total ?? 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </DataTable>
  )
}
```
