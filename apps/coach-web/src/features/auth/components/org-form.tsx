import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface OrgFormData {
  name: string
  slug: string
}

interface OrgFormProps {
  onSubmit: (data: OrgFormData) => void | Promise<void>
  isLoading?: boolean
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function OrgForm({ onSubmit, isLoading }: OrgFormProps) {
  const userEditedSlug = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrgFormData>({
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
        <FieldContent>
          <FieldLabel htmlFor="name">Nombre de la organizacion</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Mi Gimnasio"
            aria-invalid={!!errors.name}
            {...register('name', {
              required: 'El nombre de la organizacion es obligatorio',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres',
              },
              maxLength: {
                value: 50,
                message: 'El nombre no puede superar los 50 caracteres',
              },
              onChange: handleNameChange,
            })}
          />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldContent>
          <FieldLabel htmlFor="slug">URL personalizada</FieldLabel>
          <Input
            id="slug"
            type="text"
            placeholder="mi-gimnasio"
            aria-invalid={!!errors.slug}
            {...register('slug', {
              required: 'La URL es obligatoria',
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: 'Solo puede contener letras minusculas, numeros y guiones',
              },
              minLength: {
                value: 2,
                message: 'La URL debe tener al menos 2 caracteres',
              },
              onChange: handleSlugChange,
            })}
          />
          <FieldDescription>
            Se usara en la URL de tu organizacion. Solo se permiten letras minusculas, numeros y guiones.
          </FieldDescription>
          <FieldError errors={[errors.slug]} />
        </FieldContent>
      </Field>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
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
