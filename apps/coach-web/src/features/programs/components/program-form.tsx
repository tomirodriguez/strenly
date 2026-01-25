import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateProgramInput, createProgramInputSchema } from '@strenly/contracts/programs/program'
import { ChevronDownIcon, Loader2Icon, SearchIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

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
  const [isAthletePopoverOpen, setIsAthletePopoverOpen] = useState(false)
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
            render={({ field }) => (
              <Popover open={isAthletePopoverOpen} onOpenChange={setIsAthletePopoverOpen}>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      id="athlete"
                      className={cn(
                        'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm shadow-xs transition-[color,box-shadow]',
                        'focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'dark:bg-input/30 dark:hover:bg-input/50',
                        !field.value && 'text-muted-foreground',
                      )}
                    />
                  }
                >
                  <span className="flex-1 truncate">
                    {field.value ? selectedAthleteName || 'Cargando...' : 'Seleccionar atleta...'}
                  </span>
                  {field.value ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="h-5 w-5 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        field.onChange(undefined)
                        setSelectedAthleteName('')
                      }}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-[var(--anchor-width)] p-0" sideOffset={4}>
                  <div className="flex flex-col">
                    {/* Search input inside dropdown */}
                    <div className="flex items-center border-b px-3 py-2">
                      <SearchIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Buscar atleta..."
                        value={athleteSearch}
                        onChange={(e) => setAthleteSearch(e.target.value)}
                      />
                      {isLoadingAthletes && <Loader2Icon className="ml-2 h-4 w-4 shrink-0 animate-spin" />}
                    </div>

                    {/* Athlete list */}
                    <div className="max-h-60 overflow-y-auto p-1">
                      {/* Clear selection option */}
                      <button
                        type="button"
                        className={cn(
                          'flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-left text-muted-foreground text-sm',
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                        )}
                        onClick={() => {
                          field.onChange(undefined)
                          setSelectedAthleteName('')
                          setAthleteSearch('')
                          setIsAthletePopoverOpen(false)
                        }}
                      >
                        Sin atleta asignado
                      </button>

                      {/* Loading state */}
                      {isLoadingAthletes && athletes.length === 0 && (
                        <div className="py-6 text-center text-muted-foreground text-sm">Buscando...</div>
                      )}

                      {/* Empty state */}
                      {!isLoadingAthletes && athletes.length === 0 && debouncedSearch && (
                        <div className="py-6 text-center text-muted-foreground text-sm">No se encontraron atletas</div>
                      )}

                      {/* Athlete options */}
                      {athletes.map((athlete) => (
                        <button
                          key={athlete.id}
                          type="button"
                          className={cn(
                            'flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-left text-sm',
                            'hover:bg-accent hover:text-accent-foreground',
                            'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                            field.value === athlete.id && 'bg-accent',
                          )}
                          onClick={() => {
                            field.onChange(athlete.id)
                            setSelectedAthleteName(athlete.name)
                            setAthleteSearch('')
                            setIsAthletePopoverOpen(false)
                          }}
                        >
                          {athlete.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
