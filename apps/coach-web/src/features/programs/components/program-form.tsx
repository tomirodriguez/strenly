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

type AthleteOption = {
  id: string
  name: string
}

type ProgramFormProps = {
  id?: string
  onSubmit: (data: CreateProgramInput) => void
  defaultValues?: Partial<CreateProgramInput>
  /** Whether to show the weeks count field (hidden when creating from template) */
  showWeeksCount?: boolean
  /** Whether to show the sessions count field (hidden when creating from template) */
  showSessionsCount?: boolean
  /** Available athletes for the athlete selector */
  athletes: AthleteOption[]
  /** Whether athletes are currently loading */
  isLoadingAthletes: boolean
  /** Callback when the athlete search input changes */
  onAthleteSearch: (search: string) => void
}

/**
 * Form component for creating or editing a program.
 * Uses React Hook Form with Zod validation.
 * Accepts an optional id prop to link with external submit buttons.
 *
 * Pure UI component - athlete data is provided via props.
 */
export function ProgramForm({
  id,
  onSubmit,
  defaultValues,
  showWeeksCount = true,
  showSessionsCount = true,
  athletes,
  isLoadingAthletes,
  onAthleteSearch,
}: ProgramFormProps) {
  const { handleSubmit, control } = useForm<CreateProgramInput>({
    resolver: zodResolver(createProgramInputSchema),
    defaultValues: {
      name: '',
      description: '',
      athleteId: undefined,
      isTemplate: false,
      weeksCount: 4,
      sessionsCount: 3,
      ...defaultValues,
    },
  })

  // Local search input state (controls what the user sees in the combobox input)
  const [athleteSearch, setAthleteSearch] = useState('')

  // Get athlete name for display
  const [selectedAthleteName, setSelectedAthleteName] = useState<string>('')

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
              <Input id="name" placeholder="Ej: Fuerza Maxima - Mesociclo 1" {...field} />
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
            <FieldLabel htmlFor="description">Descripcion</FieldLabel>
            <FieldContent>
              <Textarea id="description" placeholder="Descripcion opcional del programa..." rows={3} {...field} />
              <FieldDescription>Maximo 500 caracteres</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      {/* Weeks and Sessions in a compact grid */}
      {(showWeeksCount || showSessionsCount) && (
        <div className="grid grid-cols-2 gap-4">
          {showWeeksCount && (
            <Controller
              name="weeksCount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="weeksCount">Semanas</FieldLabel>
                  <FieldContent>
                    <Input
                      id="weeksCount"
                      type="number"
                      min={1}
                      max={12}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                    <FieldDescription>1-12 semanas</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
          )}
          {showSessionsCount && (
            <Controller
              name="sessionsCount"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sessionsCount">Sesiones</FieldLabel>
                  <FieldContent>
                    <Input
                      id="sessionsCount"
                      type="number"
                      min={1}
                      max={7}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                    <FieldDescription>1-7 dias/semana</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
          )}
        </div>
      )}

      <Controller
        name="athleteId"
        control={control}
        render={({ field, fieldState }) => {
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
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="athlete">Atleta</FieldLabel>
              <FieldContent>
                <Combobox value={field.value ?? ''} onValueChange={handleSelect}>
                  <ComboboxInput
                    id="athlete"
                    placeholder={field.value ? selectedAthleteName || 'Cargando...' : 'Buscar atleta...'}
                    value={athleteSearch}
                    onChange={(e) => {
                      setAthleteSearch(e.target.value)
                      onAthleteSearch(e.target.value)
                    }}
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
                <FieldDescription>
                  Asigna el programa a un atleta. Dejalo vacio para crear una plantilla reutilizable.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )
        }}
      />
    </form>
  )
}
