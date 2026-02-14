import { zodResolver } from '@hookform/resolvers/zod'
import { type SaveAsTemplateInput, saveAsTemplateInputSchema } from '@strenly/contracts/programs'
import { Controller, useForm } from 'react-hook-form'
import { useSaveAsTemplate } from '../hooks/mutations/use-save-as-template'
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
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/lib/toast'

type SaveAsTemplateFormProps = {
  id?: string
  onSubmit: (data: SaveAsTemplateInput) => void
  defaultValues?: Partial<SaveAsTemplateInput>
}

function SaveAsTemplateForm({ id, onSubmit, defaultValues }: SaveAsTemplateFormProps) {
  const { handleSubmit, control } = useForm<SaveAsTemplateInput>({
    resolver: zodResolver(saveAsTemplateInputSchema),
    defaultValues,
  })

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="template-name">
              Nombre de la plantilla <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input id="template-name" placeholder="Ej: Fuerza Maxima - Mesociclo Base" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="template-description">Descripcion</FieldLabel>
            <FieldContent>
              <Textarea
                id="template-description"
                placeholder="Descripcion de la plantilla (opcional)..."
                rows={3}
                {...field}
              />
              <FieldDescription>Maximo 500 caracteres</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      {/* Hidden field for programId - submitted with form data */}
      <Controller name="programId" control={control} render={({ field }) => <input type="hidden" {...field} />} />
    </form>
  )
}

type SaveAsTemplateDialogProps = {
  programId: string
  programName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * Dialog for saving a program as a reusable template.
 * Creates a copy of the program with isTemplate: true and athleteId: null.
 */
export function SaveAsTemplateDialog({
  programId,
  programName,
  open,
  onOpenChange,
  onSuccess,
}: SaveAsTemplateDialogProps) {
  const saveAsTemplateMutation = useSaveAsTemplate()

  const handleSubmit = (data: SaveAsTemplateInput) => {
    saveAsTemplateMutation.mutate(
      {
        ...data,
        programId, // Ensure programId is always the current one
      },
      {
        onSuccess: () => {
          toast.success('Plantilla guardada exitosamente')
          onOpenChange(false)
          onSuccess?.()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar como plantilla</DialogTitle>
          <DialogDescription>
            Crea una plantilla reutilizable a partir de este programa. La plantilla incluira todas las semanas, sesiones
            y ejercicios configurados.
          </DialogDescription>
        </DialogHeader>

        <SaveAsTemplateForm
          id="save-as-template-form"
          onSubmit={handleSubmit}
          defaultValues={{
            programId,
            name: `${programName} (plantilla)`,
            description: '',
          }}
        />

        <DialogFooter>
          <DialogClose>
            <Button variant="outline" disabled={saveAsTemplateMutation.isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="save-as-template-form" disabled={saveAsTemplateMutation.isPending}>
            {saveAsTemplateMutation.isPending ? 'Guardando...' : 'Guardar plantilla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
