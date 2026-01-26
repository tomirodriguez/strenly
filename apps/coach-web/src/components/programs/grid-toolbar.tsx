import { CalendarDays, Columns, Plus } from 'lucide-react'
import { useState } from 'react'
import { AddSessionModal } from './add-session-modal'
import { Button } from '@/components/ui/button'
import { useGridActions } from '@/stores/grid-store'

type GridToolbarProps = {
  weekCount: number
  sessionCount: number
}

/**
 * Toolbar for the program grid editor.
 * Shows week/session counts and provides buttons to add structure.
 * - Add Week: Updates local state (no API call until save)
 * - Add Session: Opens modal for name input, updates local state
 */
export function GridToolbar({ weekCount, sessionCount }: GridToolbarProps) {
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const { addWeek } = useGridActions()

  const handleAddWeek = () => {
    addWeek() // Local state only - no API call
  }

  return (
    <>
      <div className="flex items-center justify-between border-border border-t bg-muted/30 px-4 py-2">
        {/* Counts */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <Columns className="size-4" />
            <span>
              {weekCount} {weekCount === 1 ? 'semana' : 'semanas'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            <span>
              {sessionCount} {sessionCount === 1 ? 'sesion' : 'sesiones'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddWeek}>
            <Plus className="size-4" />
            Semana
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddSessionOpen(true)}>
            <Plus className="size-4" />
            Sesion
          </Button>
        </div>
      </div>

      <AddSessionModal open={addSessionOpen} onOpenChange={setAddSessionOpen} />
    </>
  )
}
