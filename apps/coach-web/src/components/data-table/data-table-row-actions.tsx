import { MoreHorizontal } from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type RowAction<TData> = {
  label: string
  icon?: ComponentType<{ className?: string }>
  onClick: (row: TData) => void
  variant?: 'default' | 'destructive'
}

type DataTableRowActionsProps<TData> = {
  row: TData
  actions: RowAction<TData>[]
}

export function DataTableRowActions<TData>({ row, actions }: DataTableRowActionsProps<TData>) {
  if (actions.length === 0) {
    return null
  }

  const defaultActions = actions.filter((action) => action.variant !== 'destructive')
  const destructiveActions = actions.filter((action) => action.variant === 'destructive')
  const hasDestructiveActions = destructiveActions.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {defaultActions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem key={action.label} onClick={() => action.onClick(row)}>
              {Icon && <Icon className="h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          )
        })}

        {hasDestructiveActions && defaultActions.length > 0 && <DropdownMenuSeparator />}

        {destructiveActions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem key={action.label} variant="destructive" onClick={() => action.onClick(row)}>
              {Icon && <Icon className="h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
