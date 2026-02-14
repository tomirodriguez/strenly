import { ArrowDownIcon, ArrowUpIcon, ArrowUpToLineIcon, MoreVerticalIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteExerciseRow, useReorderExerciseRows } from '@/features/programs/hooks/mutations/use-grid-mutations'
import { toast } from '@/lib/toast'
import { useGridStore } from '@/stores/grid-store'

interface ExerciseRowActionsProps {
  programId: string
  sessionId: string
  rowId: string
  exerciseName: string
  /** All row IDs in this session, in order */
  sessionRowIds: string[]
  onClose?: () => void
}

/**
 * Context menu/dropdown for exercise row actions:
 * - Move up/down
 * - Add to/remove from superset
 * - Delete exercise
 */
export function ExerciseRowActions({
  programId,
  sessionId,
  rowId,
  exerciseName,
  sessionRowIds,
  onClose,
}: ExerciseRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteExerciseRow = useDeleteExerciseRow(programId)
  const reorderRows = useReorderExerciseRows(programId)
  const groupWithAbove = useGridStore((state) => state.groupWithAbove)

  // Calculate current position in session
  const currentIndex = sessionRowIds.indexOf(rowId)
  const canMoveUp = currentIndex > 0
  const canMoveDown = currentIndex < sessionRowIds.length - 1 && currentIndex >= 0

  // Determine if there's a group above to merge with
  // First exercise row in session cannot group with above
  const canGroupWithAbove = useMemo(() => {
    // Find all exercise rows for this session in grid data
    const gridData = useGridStore.getState().data
    if (!gridData) return false

    const sessionExerciseRows = gridData.rows.filter((row) => row.type === 'exercise' && row.sessionId === sessionId)
    const rowIndex = sessionExerciseRows.findIndex((row) => row.id === rowId)

    // Can't group if first exercise or not found
    return rowIndex > 0
  }, [sessionId, rowId])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose?.()
    }
  }

  const handleMoveUp = () => {
    if (!canMoveUp) return
    const newOrder = [...sessionRowIds]
    // Swap with previous element
    ;[newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]]
    reorderRows.mutate({ sessionId, rowIds: newOrder })
    setOpen(false)
  }

  const handleMoveDown = () => {
    if (!canMoveDown) return
    const newOrder = [...sessionRowIds]
    // Swap with next element
    ;[newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]]
    reorderRows.mutate({ sessionId, rowIds: newOrder })
    setOpen(false)
  }

  const handleGroupWithAbove = () => {
    groupWithAbove(rowId, sessionId)
    setOpen(false)
  }

  const handleDelete = () => {
    deleteExerciseRow.mutate(
      { rowId },
      {
        onSuccess: () => {
          toast.success('Ejercicio eliminado')
        },
      },
    )
    setDeleteOpen(false)
    setOpen(false)
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger
          className="flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVerticalIcon className="size-3.5" />
          <span className="sr-only">Opciones de ejercicio</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuGroup>
            {/* Move up/down options */}
            <DropdownMenuItem onClick={handleMoveUp} disabled={!canMoveUp || reorderRows.isPending}>
              <ArrowUpIcon className="size-4" />
              Mover arriba
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleMoveDown} disabled={!canMoveDown || reorderRows.isPending}>
              <ArrowDownIcon className="size-4" />
              Mover abajo
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Superset options */}
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleGroupWithAbove} disabled={!canGroupWithAbove}>
              <ArrowUpToLineIcon className="size-4" />
              Agrupar arriba
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2Icon className="size-4" />
              Eliminar ejercicio
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ejercicio</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara "{exerciseName}" y todas sus prescripciones de todas las semanas. Esta accion no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleteExerciseRow.isPending}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
