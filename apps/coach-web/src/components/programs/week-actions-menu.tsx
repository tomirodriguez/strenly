import { CopyIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { useDeleteWeek, useDuplicateWeek, useUpdateWeek } from '@/features/programs/hooks/mutations/use-grid-mutations'
import { toast } from '@/lib/toast'

interface WeekActionsMenuProps {
  programId: string
  weekId: string
  weekName: string
  isLastWeek: boolean
  onClose?: () => void
}

/**
 * Dropdown menu for week column actions: rename, duplicate, delete.
 * Integrates into week column headers in the program grid.
 */
export function WeekActionsMenu({ programId, weekId, weekName, isLastWeek, onClose }: WeekActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [newName, setNewName] = useState(weekName)

  const updateWeek = useUpdateWeek(programId)
  const duplicateWeek = useDuplicateWeek(programId)
  const deleteWeek = useDeleteWeek(programId)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose?.()
    }
  }

  const handleRename = () => {
    if (newName.trim() && newName !== weekName) {
      updateWeek.mutate({ weekId, name: newName.trim() })
    }
    setRenameOpen(false)
    setOpen(false)
  }

  const handleDuplicate = () => {
    duplicateWeek.mutate(
      { programId, weekId },
      {
        onSuccess: () => {
          toast.success('Semana duplicada')
        },
      },
    )
    setOpen(false)
  }

  const handleDelete = () => {
    deleteWeek.mutate(
      { programId, weekId },
      {
        onSuccess: () => {
          toast.success('Semana eliminada')
        },
      },
    )
    setDeleteOpen(false)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setNewName(weekName)
      setRenameOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger
          className="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVerticalIcon className="size-3.5" />
          <span className="sr-only">Opciones de semana</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
              <PencilIcon className="size-4" />
              Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate} disabled={duplicateWeek.isPending}>
              <CopyIcon className="size-4" />
              Duplicar semana
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={isLastWeek || deleteWeek.isPending}
            >
              <Trash2Icon className="size-4" />
              Eliminar semana
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <AlertDialog open={renameOpen} onOpenChange={setRenameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renombrar semana</AlertDialogTitle>
            <AlertDialogDescription>Ingresa el nuevo nombre para esta semana.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: Semana 1, Deload, etc."
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewName(weekName)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename} disabled={updateWeek.isPending}>
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar semana</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara la semana "{weekName}" y todas sus prescripciones. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleteWeek.isPending}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
