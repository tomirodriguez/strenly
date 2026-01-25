import { CalendarDays, Columns, Plus } from 'lucide-react'
import { useState } from 'react'
import { AddSessionModal } from './add-session-modal'
import { Button } from '@/components/ui/button'
import { useAddWeek } from '@/features/programs/hooks/mutations/use-grid-mutations'

type GridToolbarProps = {
  programId: string
  weekCount: number
  sessionCount: number
}

/**
 * Toolbar for the program grid editor.
 * Shows week/session counts and provides buttons to add structure.
 * - Add Week: Directly adds with auto-generated name
 * - Add Session: Opens modal for name input (required field)
 */
export function GridToolbar({ programId, weekCount, sessionCount }: GridToolbarProps) {
  const [addSessionOpen, setAddSessionOpen] = useState(false)
  const addWeek = useAddWeek(programId)

  const handleAddWeek = () => {
    addWeek.mutate({ programId })
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
          <Button variant="outline" size="sm" onClick={handleAddWeek} disabled={addWeek.isPending}>
            <Plus className="size-4" />
            Semana
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddSessionOpen(true)}>
            <Plus className="size-4" />
            Sesion
          </Button>
        </div>
      </div>

      <AddSessionModal programId={programId} open={addSessionOpen} onOpenChange={setAddSessionOpen} />
    </>
  )
}
