import { programStatusSchema } from '@strenly/contracts/programs/program'
import { useNavigate } from '@tanstack/react-router'
import { FileTextIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ProgramsTable } from '../components/programs-table'
import type { ProgramRow } from '../components/programs-table-columns'
import { useArchiveProgram } from '../hooks/mutations/use-archive-program'
import { useDuplicateProgram } from '../hooks/mutations/use-duplicate-program'
import { usePrograms } from '../hooks/queries/use-programs'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'
import { useOrgSlug } from '@/hooks/use-org-slug'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'archived', label: 'Archivado' },
]

const DEFAULT_PAGE_SIZE = 20

/**
 * Programs list view with search, filtering, and CRUD operations.
 * Displays programs as a DataTable for scalable list view.
 */
export function ProgramsListView() {
  const orgSlug = useOrgSlug()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showTemplates, setShowTemplates] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Parse status filter safely
  const parsedStatus = statusFilter === 'all' ? undefined : programStatusSchema.safeParse(statusFilter)
  const activeStatus = parsedStatus?.success ? parsedStatus.data : undefined

  // Fetch programs with current filters and pagination
  const { data, isLoading, error, refetch } = usePrograms({
    search: search || undefined,
    status: activeStatus,
    isTemplate: showTemplates ? true : undefined,
    limit: pageSize,
    offset: pageIndex * pageSize,
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

  const handleEditProgram = useCallback(
    (program: ProgramRow) => {
      navigate({ to: '/$orgSlug/programs/$programId', params: { orgSlug, programId: program.id } })
    },
    [navigate, orgSlug],
  )

  const handleDuplicateProgram = useCallback(
    (program: ProgramRow) => {
      duplicateMutation.mutate({
        sourceProgramId: program.id,
        name: `${program.name} (copia)`,
        athleteId: program.athleteId ?? undefined,
        isTemplate: program.isTemplate,
      })
    },
    [duplicateMutation],
  )

  const handleArchiveProgram = useCallback(
    (program: ProgramRow) => {
      if (window.confirm(`Estas seguro de que quieres archivar "${program.name}"?`)) {
        archiveMutation.mutate({ programId: program.id })
      }
    },
    [archiveMutation],
  )

  const handlePageChange = useCallback((newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }, [])

  // Map programs to include athlete names for display
  const programsWithNames: ProgramRow[] =
    data?.items.map((program) => ({
      ...program,
      athleteName: program.athleteId ? athleteMap.get(program.athleteId) : undefined,
    })) ?? []

  const totalCount = data?.totalCount ?? 0
  const hasFilters = !!search || statusFilter !== 'all' || showTemplates
  const showEmptyState = !isLoading && programsWithNames.length === 0

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
            onChange={(e) => {
              setSearch(e.target.value)
              setPageIndex(0) // Reset to first page on search
            }}
            className="pl-9"
          />
        </div>

        <Select
          items={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(v) => {
            if (v) {
              const parsed = programStatusSchema.safeParse(v)
              setStatusFilter(parsed.success ? parsed.data : 'all')
              setPageIndex(0) // Reset to first page on filter change
            }
          }}
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
            onCheckedChange={(checked) => {
              setShowTemplates(checked === true)
              setPageIndex(0) // Reset to first page on filter change
            }}
          />
          <FieldLabel htmlFor="show-templates" className="font-normal text-sm">
            Solo plantillas
          </FieldLabel>
        </Field>
      </div>

      {/* Programs Table */}
      {showEmptyState ? (
        <EmptyState hasFilters={hasFilters} onCreateProgram={handleCreateProgram} />
      ) : (
        <ProgramsTable
          data={programsWithNames}
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          error={error ? { message: 'Error al cargar programas', retry: refetch } : null}
          onEdit={handleEditProgram}
          onDuplicate={handleDuplicateProgram}
          onArchive={handleArchiveProgram}
        />
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
