import {
  ArrowDownIcon,
  ArrowUpIcon,
  Link2Icon,
  Link2OffIcon,
  MoreVerticalIcon,
  SplitIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
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
import {
  useDeleteExerciseRow,
  useReorderExerciseRows,
  useToggleSuperset,
} from '@/features/programs/hooks/mutations/use-grid-mutations'

interface ExerciseRowActionsProps {
  programId: string
  sessionId: string
  rowId: string
  exerciseName: string
  supersetGroup: string | null
  isSubRow?: boolean
  /** All row IDs in this session, in order */
  sessionRowIds: string[]
  onAddSplitRow?: () => void
  onClose?: () => void
}

const SUPERSET_GROUPS = ['A', 'B', 'C', 'D', 'E']

/**
 * Context menu/dropdown for exercise row actions:
 * - Add split row (same exercise, different config)
 * - Add to/remove from superset
 * - Change superset group
 * - Delete exercise
 */
export function ExerciseRowActions({
  programId,
  sessionId,
  rowId,
  exerciseName,
  supersetGroup,
  isSubRow,
  sessionRowIds,
  onAddSplitRow,
  onClose,
}: ExerciseRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const toggleSuperset = useToggleSuperset(programId)
  const deleteExerciseRow = useDeleteExerciseRow(programId)
  const reorderRows = useReorderExerciseRows(programId)

  // Calculate current position in session
  const currentIndex = sessionRowIds.indexOf(rowId)
  const canMoveUp = currentIndex > 0
  const canMoveDown = currentIndex < sessionRowIds.length - 1 && currentIndex >= 0

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose?.()
    }
  }

  const handleAddSplitRow = () => {
    onAddSplitRow?.()
    setOpen(false)
  }

  const handleSetSupersetGroup = (group: string | null) => {
    toggleSuperset.mutate({ rowId, supersetGroup: group })
    setOpen(false)
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

  const handleDelete = () => {
    deleteExerciseRow.mutate({ rowId })
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

          <DropdownMenuGroup>
            {/* Add Split Row - only for main rows, not sub-rows */}
            {!isSubRow && (
              <DropdownMenuItem onClick={handleAddSplitRow}>
                <SplitIcon className="size-4" />
                Agregar fila dividida
              </DropdownMenuItem>
            )}

            {/* Superset options */}
            {supersetGroup ? (
              <>
                <DropdownMenuItem onClick={() => handleSetSupersetGroup(null)}>
                  <Link2OffIcon className="size-4" />
                  Quitar de superserie
                </DropdownMenuItem>
                {/* Change superset group */}
                {SUPERSET_GROUPS.filter((g) => g !== supersetGroup).map((group) => (
                  <DropdownMenuItem key={group} onClick={() => handleSetSupersetGroup(group)}>
                    <Link2Icon className="size-4" />
                    Cambiar a grupo {group}
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <>
                {SUPERSET_GROUPS.map((group) => (
                  <DropdownMenuItem key={group} onClick={() => handleSetSupersetGroup(group)}>
                    <Link2Icon className="size-4" />
                    Agregar a superserie {group}
                  </DropdownMenuItem>
                ))}
              </>
            )}
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
