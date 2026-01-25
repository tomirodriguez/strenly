import { zodResolver } from '@hookform/resolvers/zod'
import type { Athlete } from '@strenly/contracts/athletes/athlete'
import { type CreateProgramInput, createProgramInputSchema } from '@strenly/contracts/programs/program'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type ProgramFormProps = {
  id?: string
  onSubmit: (data: CreateProgramInput) => void
  defaultValues?: Partial<CreateProgramInput>
  athletes?: Athlete[]
  isLoadingAthletes?: boolean
  /** Whether to show the weeks count field (hidden when creating from template) */
  showWeeksCount?: boolean
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
  showWeeksCount = true,
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
      weeksCount: 4,
      ...defaultValues,
    },
  })

  // Local search state for athlete combobox
  const [athleteSearch, setAthleteSearch] = useState('')

  // Filter athletes based on search
  const filteredAthletes = useMemo(() => {
    if (!athleteSearch.trim()) return athletes
    const searchLower = athleteSearch.toLowerCase()
    return athletes.filter((athlete) => athlete.name.toLowerCase().includes(searchLower))
  }, [athletes, athleteSearch])

  // Get athlete name for display
  const getAthleteName = (athleteId: string | undefined): string => {
    if (!athleteId) return ''
    const athlete = athletes.find((a) => a.id === athleteId)
    return athlete?.name ?? ''
  }

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

      {showWeeksCount && (
        <Field>
          <FieldLabel htmlFor="weeksCount">Semanas iniciales</FieldLabel>
          <FieldContent>
            <Input
              id="weeksCount"
              type="number"
              min={1}
              max={12}
              {...register('weeksCount', { valueAsNumber: true })}
            />
            <FieldDescription>Cantidad de semanas para crear inicialmente (1-12)</FieldDescription>
            <FieldError errors={[errors.weeksCount]} />
          </FieldContent>
        </Field>
      )}

      <Field>
        <FieldLabel htmlFor="athlete">Atleta</FieldLabel>
        <FieldContent>
          <Controller
            control={control}
            name="athleteId"
            render={({ field }) => (
              <Combobox
                value={field.value ?? ''}
                onValueChange={(value) => {
                  field.onChange(value || undefined)
                  // Clear search when selection is made
                  if (value) setAthleteSearch('')
                }}
              >
                <ComboboxInput
                  id="athlete"
                  placeholder={isLoadingAthletes ? 'Cargando atletas...' : 'Buscar atleta...'}
                  value={field.value ? getAthleteName(field.value) : athleteSearch}
                  onChange={(e) => {
                    // When typing, clear the selection and update search
                    if (field.value) {
                      field.onChange(undefined)
                    }
                    setAthleteSearch(e.target.value)
                  }}
                  showClear={!!field.value}
                  disabled={isLoadingAthletes}
                />
                <ComboboxContent>
                  <ComboboxList>
                    <ComboboxItem value="">Sin atleta asignado</ComboboxItem>
                    {filteredAthletes.map((athlete) => (
                      <ComboboxItem key={athlete.id} value={athlete.id}>
                        {athlete.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                  <ComboboxEmpty>No se encontraron atletas</ComboboxEmpty>
                </ComboboxContent>
              </Combobox>
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
