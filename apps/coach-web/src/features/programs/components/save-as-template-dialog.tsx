import { zodResolver } from '@hookform/resolvers/zod'
import { type SaveAsTemplateInput, saveAsTemplateInputSchema } from '@strenly/contracts/programs'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { useSaveAsTemplate } from '../hooks/mutations/use-save-as-template'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const saveAsTemplateMutation = useSaveAsTemplate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SaveAsTemplateInput>({
    resolver: zodResolver(saveAsTemplateInputSchema),
    defaultValues: {
      programId,
      name: `${programName} (plantilla)`,
      description: '',
    },
  })

  const onSubmit = (data: SaveAsTemplateInput) => {
    setIsSubmitting(true)
    saveAsTemplateMutation.mutate(
      {
        ...data,
        programId, // Ensure programId is always the current one
      },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          reset()
          onOpenChange(false)
          onSuccess?.()
        },
        onError: () => {
          setIsSubmitting(false)
        },
      },
    )
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset({
        programId,
        name: `${programName} (plantilla)`,
        description: '',
      })
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar como plantilla</DialogTitle>
          <DialogDescription>
            Crea una plantilla reutilizable a partir de este programa. La plantilla incluira todas las semanas,
            sesiones y ejercicios configurados.
          </DialogDescription>
        </DialogHeader>

        <form id="save-as-template-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="template-name">
              Nombre de la plantilla <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input id="template-name" {...register('name')} placeholder="Ej: Fuerza Maxima - Mesociclo Base" />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="template-description">Descripcion</FieldLabel>
            <FieldContent>
              <Textarea
                id="template-description"
                {...register('description')}
                placeholder="Descripcion de la plantilla (opcional)..."
                rows={3}
              />
              <FieldDescription>Maximo 500 caracteres</FieldDescription>
              <FieldError errors={[errors.description]} />
            </FieldContent>
          </Field>
        </form>

        <DialogFooter>
          <DialogClose>
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="save-as-template-form" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar plantilla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
