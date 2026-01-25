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
import { useAddSplitRow } from '@/features/programs/hooks/mutations/use-grid-mutations'

type SplitRowDialogProps = {
  programId: string
  parentRowId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COMMON_SET_TYPES = ['HEAVY SINGLES', 'BACK-OFF', 'TOP SET', 'WARM-UP', 'PAUSED']

/**
 * Dialog for adding a split row (same exercise, different set configuration).
 * Prompts for a set type label like "HEAVY SINGLES" or "BACK-OFF".
 */
export function SplitRowDialog({ programId, parentRowId, open, onOpenChange }: SplitRowDialogProps) {
  const [setTypeLabel, setSetTypeLabel] = useState('')
  const addSplitRow = useAddSplitRow(programId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedLabel = setTypeLabel.trim()
    if (!trimmedLabel || !parentRowId) return

    addSplitRow.mutate(
      {
        parentRowId,
        setTypeLabel: trimmedLabel,
      },
      {
        onSuccess: () => {
          setSetTypeLabel('')
          onOpenChange(false)
        },
      },
    )
  }

  const handleSelectPreset = (preset: string) => {
    setSetTypeLabel(preset)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSetTypeLabel('')
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar fila dividida</DialogTitle>
          <DialogDescription>
            Agrega una configuracion alternativa para el mismo ejercicio. Por ejemplo, "HEAVY SINGLES" seguido de
            "BACK-OFF".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="set-type-label">Tipo de serie *</Label>
              <Input
                id="set-type-label"
                value={setTypeLabel}
                onChange={(e) => setSetTypeLabel(e.target.value)}
                placeholder="BACK-OFF"
                maxLength={30}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Selecciones comunes</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SET_TYPES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs transition-colors hover:bg-muted"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addSplitRow.isPending || !setTypeLabel.trim()}>
              {addSplitRow.isPending ? 'Agregando...' : 'Agregar Fila'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
