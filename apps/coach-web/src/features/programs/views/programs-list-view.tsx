import type { Program, ProgramStatus } from '@strenly/contracts/programs/program'
import { useNavigate, useParams } from '@tanstack/react-router'
import { FileTextIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { ProgramCard } from '../components/program-card'
import { useArchiveProgram } from '../hooks/mutations/use-archive-program'
import { useDuplicateProgram } from '../hooks/mutations/use-duplicate-program'
import { usePrograms } from '../hooks/queries/use-programs'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'archived', label: 'Archivado' },
]

/**
 * Programs list view with search, filtering, and CRUD operations.
 * Displays programs as a card grid for visual browsing.
 */
export function ProgramsListView() {
  const params = useParams({ strict: false })
  const orgSlug = (params as { orgSlug?: string }).orgSlug ?? ''
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | 'all'>('all')
  const [showTemplates, setShowTemplates] = useState(false)

  // Fetch programs with current filters
  const { data, isLoading } = usePrograms({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    isTemplate: showTemplates ? true : undefined,
    limit: 50,
  })

  // Fetch athletes for name lookup
  const { data: athletesData } = useAthletes({ status: 'active', limit: 100 })
  const athleteMap = new Map(athletesData?.items.map((a) => [a.id, a.name]) ?? [])

  // Mutations
  const duplicateMutation = useDuplicateProgram()
  const archiveMutation = useArchiveProgram()

  const handleCreateProgram = () => {
    navigate({ to: '/$orgSlug/programs/new', params: { orgSlug } })
  }

  const handleEditProgram = (program: Program) => {
    navigate({ to: '/$orgSlug/programs/$programId', params: { orgSlug, programId: program.id } })
  }

  const handleDuplicateProgram = (program: Program) => {
    duplicateMutation.mutate({
      sourceProgramId: program.id,
      name: `${program.name} (copia)`,
      athleteId: program.athleteId ?? undefined,
      isTemplate: program.isTemplate,
    })
  }

  const handleArchiveProgram = (program: Program) => {
    if (window.confirm(`Estas seguro de que quieres archivar "${program.name}"?`)) {
      archiveMutation.mutate({ programId: program.id })
    }
  }

  const programs = data?.items ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Programas</h1>
          <p className="text-muted-foreground text-sm">Crea y gestiona los programas de entrenamiento</p>
        </div>
        <Button onClick={handleCreateProgram}>
          <PlusIcon className="h-4 w-4" />
          Crear Programa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar programas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          items={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ProgramStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Field orientation="horizontal" className="gap-2">
          <Checkbox
            id="show-templates"
            checked={showTemplates}
            onCheckedChange={(checked) => setShowTemplates(checked === true)}
          />
          <FieldLabel htmlFor="show-templates" className="font-normal text-sm">
            Solo plantillas
          </FieldLabel>
        </Field>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-[160px] rounded-xl" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          hasFilters={!!search || statusFilter !== 'all' || showTemplates}
          onCreateProgram={handleCreateProgram}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              athleteName={program.athleteId ? athleteMap.get(program.athleteId) : undefined}
              onEdit={handleEditProgram}
              onDuplicate={handleDuplicateProgram}
              onArchive={handleArchiveProgram}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type EmptyStateProps = {
  hasFilters: boolean
  onCreateProgram: () => void
}

function EmptyState({ hasFilters, onCreateProgram }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <SearchIcon className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 font-semibold text-lg">No se encontraron programas</h3>
        <p className="mt-2 text-muted-foreground text-sm">Intenta ajustar los filtros o crear un nuevo programa.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <FileTextIcon className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 font-semibold text-lg">Sin programas todavia</h3>
      <p className="mt-2 max-w-sm text-muted-foreground text-sm">
        Crea tu primer programa de entrenamiento para empezar a planificar.
      </p>
      <Button onClick={onCreateProgram} className="mt-6">
        <PlusIcon className="h-4 w-4" />
        Crear Programa
      </Button>
    </div>
  )
}
