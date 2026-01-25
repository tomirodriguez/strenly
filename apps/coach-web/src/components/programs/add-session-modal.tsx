import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAddSession } from '@/features/programs/hooks/mutations/use-grid-mutations'

type AddSessionModalProps = {
  programId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal for adding a new session (training day) to the program.
 * Session name is required (e.g., "DIA 4 - PULL").
 */
export function AddSessionModal({ programId, open, onOpenChange }: AddSessionModalProps) {
  const [name, setName] = useState('')
  const addSession = useAddSession(programId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    addSession.mutate(
      {
        programId,
        name: trimmedName,
      },
      {
        onSuccess: () => {
          setName('')
          onOpenChange(false)
        },
      },
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('')
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Sesion</DialogTitle>
          <DialogDescription>
            Agrega un nuevo dia de entrenamiento al programa. Por ejemplo: "DIA 4 - PULL" o "TREN SUPERIOR".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Nombre de la sesion *</Label>
              <Input
                id="session-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="DIA 1 - PUSH"
                maxLength={100}
                required
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addSession.isPending || !name.trim()}>
              {addSession.isPending ? 'Agregando...' : 'Agregar Sesion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
