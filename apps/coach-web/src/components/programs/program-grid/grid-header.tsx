import { WeekActionsMenu } from '../week-actions-menu'
import type { GridColumn } from './types'
import { cn } from '@/lib/utils'

interface GridHeaderProps {
  columns: GridColumn[]
  programId: string
  weeksCount: number
}

/**
 * Grid header with sticky exercise column and week columns.
 * Each week column includes an actions menu for rename, duplicate, and delete.
 */
export function GridHeader({ columns, programId, weeksCount }: GridHeaderProps) {
  const isLastWeek = weeksCount === 1

  return (
    <thead className="sticky top-0 z-40">
      <tr className="bg-zinc-900">
        {columns.map((col, index) => (
          <th
            key={col.id}
            className={cn(
              'border-border border-r border-b-2 bg-zinc-900 px-4 py-3',
              index === 0 && 'sticky left-0 z-30 w-[320px] bg-zinc-900',
              index > 0 && 'w-56 bg-zinc-900/50',
            )}
          >
            {col.type === 'exercise' ? (
              <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                Pairing / Exercise Selection
              </span>
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">
                  {col.name}
                </span>
                {col.weekId && (
                  <WeekActionsMenu
                    programId={programId}
                    weekId={col.weekId}
                    weekName={col.name}
                    isLastWeek={isLastWeek}
                  />
                )}
              </div>
            )}
          </th>
        ))}
      </tr>
    </thead>
  )
}
