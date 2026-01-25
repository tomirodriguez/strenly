import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { type CreateAthleteInput, createAthleteInputSchema } from '@strenly/contracts/athletes/athlete'
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateAthleteInput>({
    resolver: standardSchemaResolver(createAthleteInputSchema),
    defaultValues,
  })

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="name">
          Nombre <span className="text-destructive">*</span>
        </FieldLabel>
        <FieldContent>
          <Input id="name" {...register('name')} placeholder="Ingresa el nombre del atleta" />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Correo electronico</FieldLabel>
        <FieldContent>
          <Input id="email" type="email" {...register('email')} placeholder="atleta@ejemplo.com" />
          <FieldDescription>Opcional. Se usa para enviar invitaciones a la app de atletas.</FieldDescription>
          <FieldError errors={[errors.email]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="phone">Telefono</FieldLabel>
        <FieldContent>
          <Input id="phone" {...register('phone')} placeholder="+1 (555) 000-0000" />
          <FieldError errors={[errors.phone]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="birthdate">Fecha de nacimiento</FieldLabel>
        <FieldContent>
          <Input id="birthdate" type="date" {...register('birthdate')} />
          <FieldError errors={[errors.birthdate]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="gender">Genero</FieldLabel>
        <FieldContent>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Seleccionar genero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.gender]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="notes">Notas</FieldLabel>
        <FieldContent>
          <Textarea id="notes" {...register('notes')} placeholder="Notas adicionales sobre el atleta..." rows={4} />
          <FieldError errors={[errors.notes]} />
        </FieldContent>
      </Field>
    </form>
  )
}
