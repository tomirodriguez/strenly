import { zodResolver } from '@hookform/resolvers/zod'
import { type AddWeekInput, addWeekInputSchema } from '@strenly/contracts/programs/week'
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

type AddWeekModalProps = {
  programId: string
  weekCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddWeekInput) => void
  isSubmitting?: boolean
}

/**
 * Modal for adding a new week (column) to the program grid.
 * Week name is optional and defaults to "Semana {N+1}".
 *
 * Pure UI component - mutation is handled by the parent.
 */
export function AddWeekModal({ programId, weekCount, open, onOpenChange, onSubmit, isSubmitting }: AddWeekModalProps) {
  const defaultName = `Semana ${weekCount + 1}`

  const { handleSubmit, control, reset } = useForm<AddWeekInput>({
    resolver: zodResolver(addWeekInputSchema),
    defaultValues: {
      programId,
      name: '',
    },
  })

  const handleFormSubmit = (data: AddWeekInput) => {
    onSubmit({
      ...data,
      name: data.name?.trim() || undefined,
    })
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
          <DialogTitle>Agregar Semana</DialogTitle>
          <DialogDescription>
            Agrega una nueva columna de semana al programa. Si no especificas un nombre, se usara "{defaultName}".
          </DialogDescription>
        </DialogHeader>

        <form id="add-week-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <fieldset disabled={isSubmitting} className="space-y-4 py-4">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="week-name">Nombre de la semana</FieldLabel>
                  <FieldContent>
                    <Input id="week-name" placeholder={defaultName} maxLength={50} autoFocus {...field} />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
          </fieldset>
        </form>

        <DialogFooter>
          <DialogClose>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="add-week-form" disabled={isSubmitting}>
            {isSubmitting ? 'Agregando...' : 'Agregar Semana'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
