import { zodResolver } from '@hookform/resolvers/zod'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const orgFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres'),
  slug: z
    .string()
    .min(2, 'La URL debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo puede contener letras minusculas, numeros y guiones'),
})

type OrgFormData = z.infer<typeof orgFormSchema>

interface OrgFormProps {
  onSubmit: (data: OrgFormData) => void | Promise<void>
  isSubmitting?: boolean
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function OrgForm({ onSubmit, isSubmitting }: OrgFormProps) {
  const userEditedSlug = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    // Auto-generate slug if user hasn't manually edited it
    if (!userEditedSlug.current) {
      setValue('slug', generateSlug(newName))
    }
  }

  const handleSlugChange = () => {
    userEditedSlug.current = true
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">Nombre de la organizacion</FieldLabel>
        <FieldContent>
          <Input
            id="name"
            type="text"
            placeholder="Mi Gimnasio"
            aria-invalid={!!errors.name}
            {...register('name', { onChange: handleNameChange })}
          />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="slug">URL personalizada</FieldLabel>
        <FieldContent>
          <Input
            id="slug"
            type="text"
            placeholder="mi-gimnasio"
            aria-invalid={!!errors.slug}
            {...register('slug', { onChange: handleSlugChange })}
          />
          <FieldDescription>
            Se usara en la URL de tu organizacion. Solo se permiten letras minusculas, numeros y guiones.
          </FieldDescription>
          <FieldError errors={[errors.slug]} />
        </FieldContent>
      </Field>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Creando organizacion...
          </span>
        ) : (
          'Crear organizacion'
        )}
      </Button>
    </form>
  )
}
