import type { ColumnDef, RowData } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import { DataTableRowActions, type RowAction } from './data-table-row-actions'

type ActionsColumnOptions<TData> = {
  id?: string
  actions: (row: TData) => RowAction<TData>[]
}

type ColumnHelperWrapper<TData extends RowData> = {
  accessor: ReturnType<typeof createColumnHelper<TData>>['accessor']
  display: ReturnType<typeof createColumnHelper<TData>>['display']
  actions: (options: ActionsColumnOptions<TData>) => ColumnDef<TData, unknown>
}

/**
 * Creates type-safe DataTable column definitions using a helper pattern.
 *
 * Usage:
 * ```tsx
 * const columns = createDataTableColumns<MyType>((helper) => [
 *   helper.accessor('name', { header: 'Nombre' }),
 *   helper.actions({
 *     actions: (row) => [{ label: 'Editar', onClick: () => onEdit(row) }],
 *   }),
 * ])
 * ```
 */
export function createDataTableColumns<TData extends RowData>(
  factory: (helper: ColumnHelperWrapper<TData>) => ColumnDef<TData, unknown>[],
): ColumnDef<TData, unknown>[] {
  const tanstackHelper = createColumnHelper<TData>()

  const helper: ColumnHelperWrapper<TData> = {
    accessor: tanstackHelper.accessor.bind(tanstackHelper),
    display: tanstackHelper.display.bind(tanstackHelper),
    actions: (options: ActionsColumnOptions<TData>): ColumnDef<TData, unknown> =>
      tanstackHelper.display({
        id: options.id ?? 'actions',
        cell: (props) => <DataTableRowActions row={props.row.original} actions={options.actions(props.row.original)} />,
      }),
  }

  return factory(helper)
}
