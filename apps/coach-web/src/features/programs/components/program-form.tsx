import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateProgramInput, createProgramInputSchema } from '@strenly/contracts/programs/program'
import { Loader2Icon } from 'lucide-react'
import { useState } from 'react'
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
import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'
import { useDebounce } from '@/hooks/use-debounce'

type ProgramFormProps = {
  id?: string
  onSubmit: (data: CreateProgramInput) => void
  defaultValues?: Partial<CreateProgramInput>
  /** Whether to show the weeks count field (hidden when creating from template) */
  showWeeksCount?: boolean
}

/**
 * Form component for creating or editing a program.
 * Uses React Hook Form with Zod validation.
 * Accepts an optional id prop to link with external submit buttons.
 */
export function ProgramForm({ id, onSubmit, defaultValues, showWeeksCount = true }: ProgramFormProps) {
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

  // Search state for athlete selector
  const [athleteSearch, setAthleteSearch] = useState('')
  const debouncedSearch = useDebounce(athleteSearch, 300)

  // Server-side athlete search
  const { data: athletesData, isLoading: isLoadingAthletes } = useAthletes({
    status: 'active',
    search: debouncedSearch || undefined,
    limit: 20,
  })
  const athletes = athletesData?.items ?? []

  // Get athlete name for display (searches in current results or uses cached data)
  const [selectedAthleteName, setSelectedAthleteName] = useState<string>('')

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
            render={({ field }) => {
              const handleSelect = (value: string | null) => {
                if (value === '' || value === null) {
                  // Clear selection
                  field.onChange(undefined)
                  setSelectedAthleteName('')
                } else {
                  // Select athlete
                  const athlete = athletes.find((a) => a.id === value)
                  if (athlete) {
                    field.onChange(athlete.id)
                    setSelectedAthleteName(athlete.name)
                  }
                }
                setAthleteSearch('')
              }

              return (
                <Combobox value={field.value ?? ''} onValueChange={handleSelect}>
                  <ComboboxInput
                    id="athlete"
                    placeholder={field.value ? selectedAthleteName || 'Cargando...' : 'Buscar atleta...'}
                    value={athleteSearch}
                    onChange={(e) => setAthleteSearch(e.target.value)}
                    showTrigger
                    showClear={!!field.value}
                  />
                  <ComboboxContent sideOffset={4}>
                    <ComboboxList>
                      {/* Loading state */}
                      {isLoadingAthletes && athletes.length === 0 && (
                        <div className="py-6 text-center text-muted-foreground text-sm">
                          <Loader2Icon className="mr-2 inline h-4 w-4 animate-spin" />
                          Buscando...
                        </div>
                      )}

                      {/* Athlete options */}
                      {athletes.map((athlete) => (
                        <ComboboxItem key={athlete.id} value={athlete.id}>
                          {athlete.name}
                        </ComboboxItem>
                      ))}

                      {/* Empty state - must be inside ComboboxList for CSS visibility to work */}
                      <ComboboxEmpty>No se encontraron atletas</ComboboxEmpty>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )
            }}
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
