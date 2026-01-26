import {
  ArrowDownIcon,
  ArrowUpIcon,
  Link2Icon,
  Link2OffIcon,
  MoreVerticalIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
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
import { useGridStore } from '@/stores/grid-store'

/** Minimal row data needed for group calculations */
export interface SessionRowData {
  id: string
  groupId: string | null
}

interface ExerciseRowActionsProps {
  programId: string
  sessionId: string
  rowId: string
  exerciseName: string
  /** Current row's superset group (null if not in a superset) */
  supersetGroup: string | null
  /** All row IDs in this session, in order */
  sessionRowIds: string[]
  /** All rows in this session with group data for dynamic group calculation */
  sessionRows: SessionRowData[]
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
  supersetGroup,
  sessionRowIds,
  sessionRows,
  onClose,
}: ExerciseRowActionsProps) {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteExerciseRow = useDeleteExerciseRow(programId)
  const reorderRows = useReorderExerciseRows(programId)
  const updateSupersetGroup = useGridStore((state) => state.updateSupersetGroup)

  // Calculate current position in session
  const currentIndex = sessionRowIds.indexOf(rowId)
  const canMoveUp = currentIndex > 0
  const canMoveDown = currentIndex < sessionRowIds.length - 1 && currentIndex >= 0

  // Derive existing superset groups from session rows (excluding current row)
  const { existingGroups, nextAvailableLetter } = useMemo(() => {
    const groups = new Set<string>()
    for (const row of sessionRows) {
      if (row.groupId && row.id !== rowId) {
        groups.add(row.groupId)
      }
    }
    const sortedGroups = Array.from(groups).sort()

    // Calculate next available letter (A, B, C, ...)
    // Include current row's group in used letters to avoid reusing it
    const allGroups = new Set<string>()
    for (const row of sessionRows) {
      if (row.groupId) {
        allGroups.add(row.groupId)
      }
    }
    let nextLetter = 'A'
    while (allGroups.has(nextLetter) && nextLetter <= 'Z') {
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1)
    }

    return { existingGroups: sortedGroups, nextAvailableLetter: nextLetter }
  }, [sessionRows, rowId])

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

  const handleSetSupersetGroup = (group: string | null) => {
    updateSupersetGroup(rowId, group)
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

          {/* Superset options */}
          <DropdownMenuGroup>
            {supersetGroup ? (
              <>
                <DropdownMenuItem onClick={() => handleSetSupersetGroup(null)}>
                  <Link2OffIcon className="size-4" />
                  Quitar de superserie
                </DropdownMenuItem>
                {/* Change to existing groups (excluding current) */}
                {existingGroups
                  .filter((g) => g !== supersetGroup)
                  .map((group) => (
                    <DropdownMenuItem key={group} onClick={() => handleSetSupersetGroup(group)}>
                      <Link2Icon className="size-4" />
                      Cambiar a superserie {group}
                    </DropdownMenuItem>
                  ))}
                {/* Create new group option */}
                <DropdownMenuItem onClick={() => handleSetSupersetGroup(nextAvailableLetter)}>
                  <PlusIcon className="size-4" />
                  Crear superserie {nextAvailableLetter}
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {/* Add to existing groups */}
                {existingGroups.map((group) => (
                  <DropdownMenuItem key={group} onClick={() => handleSetSupersetGroup(group)}>
                    <Link2Icon className="size-4" />
                    Agregar a superserie {group}
                  </DropdownMenuItem>
                ))}
                {/* Create new group */}
                <DropdownMenuItem onClick={() => handleSetSupersetGroup(nextAvailableLetter)}>
                  <PlusIcon className="size-4" />
                  Crear superserie {nextAvailableLetter}
                </DropdownMenuItem>
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
