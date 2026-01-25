import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SaveButtonProps {
  isDirty: boolean
  isPending: boolean
  onSave: () => void
}

/**
 * Save button for program grid with dirty/pending state display.
 * Disabled when no changes or saving in progress.
 */
export function SaveButton({ isDirty, isPending, onSave }: SaveButtonProps) {
  return (
    <Button onClick={onSave} disabled={!isDirty || isPending} size="sm" className="min-w-[100px]">
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      ) : (
        'Guardar'
      )}
    </Button>
  )
}
