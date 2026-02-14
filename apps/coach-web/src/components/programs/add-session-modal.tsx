import { zodResolver } from '@hookform/resolvers/zod'
import { type Session, sessionSchema } from '@strenly/contracts/programs/session'
import { Controller, useForm } from 'react-hook-form'
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
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useGridActions } from '@/stores/grid-store'

/**
 * Local-only schema derived from the session entity schema.
 * The addSessionInputSchema from contracts requires programId (for API calls),
 * but this form operates on local grid state only, so we pick just the name field.
 */
const addSessionFormSchema = sessionSchema.pick({ name: true })

type AddSessionFormValues = Pick<Session, 'name'>

type AddSessionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Modal for adding a new session (training day) to the program.
 * Session name is required (e.g., "DIA 4 - PULL").
 * Updates local state only - persisted via saveDraft.
 */
export function AddSessionModal({ open, onOpenChange }: AddSessionModalProps) {
  const { addSession } = useGridActions()

  const { handleSubmit, control, reset } = useForm<AddSessionFormValues>({
    resolver: zodResolver(addSessionFormSchema),
    defaultValues: {
      name: '',
    },
  })

  const handleFormSubmit = (data: AddSessionFormValues) => {
    addSession(data.name.trim())
    reset()
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset()
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

        <form id="add-session-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="session-name">
                    Nombre de la sesion <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input id="session-name" placeholder="DIA 1 - PUSH" maxLength={100} autoFocus {...field} />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
          </div>
        </form>

        <DialogFooter>
          <DialogClose>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="add-session-form">
            Agregar Sesion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
