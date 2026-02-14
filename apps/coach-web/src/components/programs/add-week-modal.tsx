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
import { useAddWeek } from '@/features/programs/hooks/mutations/use-grid-mutations'
import { toast } from '@/lib/toast'

type AddWeekModalProps = {
  programId: string
  weekCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal for adding a new week (column) to the program grid.
 * Week name is optional and defaults to "Semana {N+1}".
 */
export function AddWeekModal({ programId, weekCount, open, onOpenChange }: AddWeekModalProps) {
  const [name, setName] = useState('')
  const addWeek = useAddWeek(programId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addWeek.mutate(
      {
        programId,
        name: name.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Semana agregada')
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

  const defaultName = `Semana ${weekCount + 1}`

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Semana</DialogTitle>
          <DialogDescription>
            Agrega una nueva columna de semana al programa. Si no especificas un nombre, se usara "{defaultName}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="week-name">Nombre de la semana</Label>
              <Input
                id="week-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={defaultName}
                maxLength={50}
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
            <Button type="submit" disabled={addWeek.isPending}>
              {addWeek.isPending ? 'Agregando...' : 'Agregar Semana'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
