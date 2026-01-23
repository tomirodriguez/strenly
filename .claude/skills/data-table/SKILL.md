---
name: data-table
description: |
  Guide for building tables with the DataTable compound component. This skill should be used when creating new tables, migrating existing tables to the DataTable pattern, or needing reference for DataTable APIs (columns, pagination, filtering, row actions). Covers imports, compound structure, column helpers, state handling, and server-side pagination.
  Do NOT load for simple lists, card grids, or non-tabular data displays.
version: 1.0.0
---

# DataTable Component Guide

A compound component for building tables with TanStack Table, supporting server-side pagination, sorting, filtering, and row selection.

## Import

```tsx
import {
  DataTable,
  DataTableColumnHeader,
  createDataTableColumns,
  type SortingState,  // For controlled sorting
} from '@strenly/ui/components/data-table'
```

## Basic Structure

```tsx
<DataTable
  data={items}
  columns={columns}
  isLoading={isLoading}
  error={error ? { message: error.message, retry: refetch } : null}
>
  <DataTable.Header title="Título" description="Descripción opcional">
    <Button>Acción</Button>
  </DataTable.Header>

  <DataTable.Toolbar>
    <DataTable.Search placeholder="Buscar..." onChange={setSearch} />
    <DataTable.FilterSelect
      placeholder="Filtro"
      options={filterOptions}
      value={filter}
      onChange={setFilter}
    />
  </DataTable.Toolbar>

  <DataTable.Content
    onRowClick={(row) => navigate(`/items/${row.id}`)}
    emptyState={{
      title: "No hay datos",
      description: "Descripción del estado vacío",
      action: <Button>Crear</Button>
    }}
  />

  <DataTable.Pagination
    pageIndex={page}
    pageSize={pageSize}
    totalCount={total}
    onPageChange={setPage}
  />
</DataTable>
```

## Column Definitions

Use `createDataTableColumns` for type-safe column definitions with built-in helpers:

```tsx
const columns = createDataTableColumns<MyType>((helper) => [
  // Selection checkbox column
  helper.selection(),

  // Sortable column with DataTableColumnHeader (recommended)
  helper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    enableSorting: true, // Enable sorting for this column
  }),

  // Non-sortable column (explicit)
  helper.accessor('email', {
    header: 'Email',
    cell: ({ getValue }) => getValue(),
    enableSorting: false, // Disable sorting
  }),

  // Sortable column with descending first (for dates)
  helper.accessor('createdAt', {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Creado" />,
    cell: ({ getValue }) => formatDate(getValue()),
    enableSorting: true,
    sortDescFirst: true, // Start with newest first
  }),

  // Actions column with dropdown menu
  helper.actions({
    actions: (row) => [
      { label: 'Editar', icon: PencilIcon, onClick: () => onEdit(row) },
      { label: 'Eliminar', icon: TrashIcon, onClick: () => onDelete(row), variant: 'destructive' },
    ],
  }),
])
```

## Server-Side Pagination (REQUIRED)

**ALL DataTables with list data MUST have pagination.** This requires backend support.

### Backend Requirements (See Related Skills)

For `DataTable.Pagination` to work, your backend MUST return `totalCount`:

| Layer | Skill | What to Add |
|-------|-------|-------------|
| Contract | `/contracts` | `limit`, `offset` in input; `totalCount` in output |
| Port | `/port` | `List{X}Result { items, totalCount }` type |
| Repository | `/repository` | Count query + paginated items query |
| Procedure | `/procedure` | Pass pagination params, return `totalCount` |

### Frontend Implementation

```tsx
const [pageIndex, setPageIndex] = useState(0)
const pageSize = 10  // Match your API default

// Query with pagination params
const { data, isLoading } = useQuery({
  queryKey: ['users', { page: pageIndex, pageSize, search }],
  queryFn: () => api.users.list({
    limit: pageSize,
    offset: pageIndex * pageSize,
    search,
  }),
})

// Reset page when filters change
const handleSearchChange = (value: string) => {
  setSearch(value)
  setPageIndex(0)  // IMPORTANT: Reset to page 0
}

<DataTable
  data={data?.users ?? []}
  columns={columns}
  isLoading={isLoading}
  pageCount={Math.ceil((data?.totalCount ?? 0) / pageSize)}
>
  {/* ... */}
  <DataTable.Pagination
    pageIndex={pageIndex}
    pageSize={pageSize}
    totalCount={data?.totalCount ?? 0}
    onPageChange={setPageIndex}
  />
</DataTable>
```

### Common Mistakes to Avoid

1. **Missing `totalCount` from backend** - Pagination won't render
2. **Not resetting page on filter change** - User sees empty page
3. **Using client-side pagination** - Performance disaster with large datasets

## Sorting (Server-Side)

Sorting is triggered by clicking sortable column headers. The header shows sort direction icons (ascending/descending).

### Column Setup

Use `DataTableColumnHeader` for sortable columns and set `enableSorting: true`:

```tsx
helper.accessor('name', {
  header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
  enableSorting: true,
})
```

### Controlled State

For server-side sorting, control the sorting state externally:

```tsx
import type { SortingState } from '@tanstack/react-table'

const [sorting, setSorting] = useState<SortingState>([])

// Use sorting in your query
const sortField = sorting[0]?.id
const sortOrder = sorting[0]?.desc ? 'desc' : 'asc'

<DataTable
  data={data}
  columns={columns}
  sorting={sorting}
  onSortingChange={setSorting}
>
  {/* ... */}
</DataTable>
```

### Column Options

| Option | Type | Description |
|--------|------|-------------|
| `enableSorting` | `boolean` | Enable/disable sorting for the column |
| `sortDescFirst` | `boolean` | Start with descending order (useful for dates) |
| `sortingFn` | `string \| function` | Custom sorting function |
| `invertSorting` | `boolean` | Invert order (for rankings where lower is better) |

## Row Selection

Enable row selection for bulk actions:

```tsx
const [selected, setSelected] = useState<RowSelectionState>({})

<DataTable
  data={data}
  columns={columns}
  rowSelection={selected}
  onRowSelectionChange={setSelected}
  getRowId={(row) => row.id}
>
  {/* ... */}
</DataTable>

// Access selected rows
const selectedIds = Object.keys(selected)
```

## State Handling

States are handled automatically based on props:

| Prop | State Rendered |
|------|----------------|
| `isLoading={true}` | Skeleton loading |
| `error={{ message: "...", retry: fn }}` | Error with retry button |
| `data={[]}` (empty) | Empty state from `emptyState` prop |

## Compound Components Reference

| Component | Purpose |
|-----------|---------|
| `DataTable.Header` | Title, description, action buttons |
| `DataTable.Toolbar` | Container for search and filters |
| `DataTable.Search` | Debounced search input with clear button |
| `DataTable.FilterSelect` | Dropdown filter |
| `DataTable.Content` | Table body, handles all states |
| `DataTable.Pagination` | Page navigation controls |
| `DataTable.ColumnHeader` | Sortable column header |

## Visual Styling

The DataTable uses a **minimal, borderless design**:

- **No outer border** - Table sits cleanly in its container
- **Soft row dividers** - 40% opacity borders between rows
- **Clean headers** - Muted text that highlights on sort
- **Sorting via headers** - Click column headers to sort (no separate dropdown)

The Toolbar is for **search and filters only** - sorting is handled through column headers using `DataTableColumnHeader`.

For detailed prop types and advanced patterns, see `references/api_reference.md`.

## Backend Skills for Pagination

When creating a new DataTable with server-side pagination, you need to update:

1. **`/contracts`** - Add `limit`/`offset` input, `totalCount` output
2. **`/port`** - Define `List{X}Result` type with `totalCount`
3. **`/repository`** - Add count query before paginated items query
4. **`/procedure`** - Pass pagination params, return `totalCount`

**Without these backend changes, `DataTable.Pagination` will not work.**
