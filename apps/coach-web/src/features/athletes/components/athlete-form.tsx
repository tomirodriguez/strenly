import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateAthleteInput, createAthleteInputSchema } from '@strenly/contracts/athletes/athlete'
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
]

type AthleteFormProps = {
  id?: string
  onSubmit: (data: CreateAthleteInput) => void
  defaultValues?: Partial<CreateAthleteInput>
}

/**
 * Form component for creating or editing an athlete.
 * Uses React Hook Form with Zod validation.
 * Accepts an optional id prop to link with external submit buttons.
 */
export function AthleteForm({ id, onSubmit, defaultValues }: AthleteFormProps) {
  const { handleSubmit, control } = useForm<CreateAthleteInput>({
    resolver: zodResolver(createAthleteInputSchema),
    defaultValues,
  })

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input id="name" placeholder="Ingresa el nombre del atleta" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="email">Correo electronico</FieldLabel>
            <FieldContent>
              <Input id="email" type="email" placeholder="atleta@ejemplo.com" {...field} />
              <FieldDescription>Opcional. Se usa para enviar invitaciones a la app de atletas.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="phone">Telefono</FieldLabel>
            <FieldContent>
              <Input id="phone" placeholder="+1 (555) 000-0000" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="birthdate"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="birthdate">Fecha de nacimiento</FieldLabel>
            <FieldContent>
              <Input id="birthdate" type="date" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="gender"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="gender">Genero</FieldLabel>
            <FieldContent>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Seleccionar genero" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="notes"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="notes">Notas</FieldLabel>
            <FieldContent>
              <Textarea id="notes" placeholder="Notas adicionales sobre el atleta..." rows={4} {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />
    </form>
  )
}
