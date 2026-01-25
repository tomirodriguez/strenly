import { zodResolver } from '@hookform/resolvers/zod'
import type { Athlete } from '@strenly/contracts/athletes/athlete'
import { type CreateProgramInput, createProgramInputSchema } from '@strenly/contracts/programs/program'
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type ProgramFormProps = {
  id?: string
  onSubmit: (data: CreateProgramInput) => void
  defaultValues?: Partial<CreateProgramInput>
  athletes?: Athlete[]
  isLoadingAthletes?: boolean
}

/**
 * Form component for creating or editing a program.
 * Uses React Hook Form with Zod validation.
 * Accepts an optional id prop to link with external submit buttons.
 */
export function ProgramForm({
  id,
  onSubmit,
  defaultValues,
  athletes = [],
  isLoadingAthletes = false,
}: ProgramFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateProgramInput>({
    resolver: zodResolver(createProgramInputSchema),
    defaultValues: {
      name: '',
      description: '',
      athleteId: undefined,
      isTemplate: false,
      ...defaultValues,
    },
  })

  // Build options for athlete select
  const athleteOptions = athletes.map((athlete) => ({
    value: athlete.id,
    label: athlete.name,
  }))

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="name">
          Nombre <span className="text-destructive">*</span>
        </FieldLabel>
        <FieldContent>
          <Input id="name" {...register('name')} placeholder="Ej: Fuerza Maxima - Mesociclo 1" />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Descripcion</FieldLabel>
        <FieldContent>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descripcion opcional del programa..."
            rows={3}
          />
          <FieldDescription>Maximo 500 caracteres</FieldDescription>
          <FieldError errors={[errors.description]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="athlete">Atleta</FieldLabel>
        <FieldContent>
          <Controller
            control={control}
            name="athleteId"
            render={({ field }) => (
              <Select
                items={athleteOptions}
                value={field.value ?? ''}
                onValueChange={(value) => field.onChange(value || undefined)}
              >
                <SelectTrigger id="athlete">
                  <SelectValue
                    placeholder={isLoadingAthletes ? 'Cargando atletas...' : 'Seleccionar atleta (opcional)'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {athleteOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldDescription>
            Asigna el programa a un atleta. Dejalo vacio para crear una plantilla reutilizable.
          </FieldDescription>
          <FieldError errors={[errors.athleteId]} />
        </FieldContent>
      </Field>
    </form>
  )
}
