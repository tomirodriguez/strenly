import { programStatusSchema } from '@strenly/contracts/programs/program'
import { useNavigate } from '@tanstack/react-router'
import type { SortingState } from '@tanstack/react-table'
import { FileTextIcon, PlusIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ProgramsTable } from '../components/programs-table'
import type { ProgramRow } from '../components/programs-table-columns'
import { useArchiveProgram } from '../hooks/mutations/use-archive-program'
import { useDuplicateProgram } from '../hooks/mutations/use-duplicate-program'
import { usePrograms } from '../hooks/queries/use-programs'
import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'
import { useOrgSlug } from '@/hooks/use-org-slug'
import { toast } from '@/lib/toast'

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
  const [sorting, setSorting] = useState<SortingState>([])

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
      duplicateMutation.mutate(
        {
          sourceProgramId: program.id,
          name: `${program.name} (copia)`,
          athleteId: program.athleteId ?? undefined,
          isTemplate: program.isTemplate,
        },
        {
          onSuccess: () => {
            toast.success('Programa duplicado exitosamente')
          },
        },
      )
    },
    [duplicateMutation],
  )

  const handleArchiveProgram = useCallback(
    (program: ProgramRow) => {
      if (window.confirm(`Estas seguro de que quieres archivar "${program.name}"?`)) {
        archiveMutation.mutate(
          { programId: program.id },
          {
            onSuccess: () => {
              toast.success('Programa archivado exitosamente')
            },
          },
        )
      }
    },
    [archiveMutation],
  )

  const handlePageChange = useCallback((newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageIndex(0)
  }

  // Map programs to include athlete names for display
  const programsWithNames: ProgramRow[] =
    data?.items.map((program) => ({
      ...program,
      athleteName: program.athleteId ? athleteMap.get(program.athleteId) : undefined,
    })) ?? []

  const totalCount = data?.totalCount ?? 0
  const hasFilters = !!search || statusFilter !== 'all' || showTemplates

  // Compute empty state based on whether filters are active
  const emptyState = hasFilters
    ? {
        title: 'No se encontraron programas',
        description: 'Intenta ajustar los filtros o crear un nuevo programa.',
      }
    : {
        icon: <FileTextIcon className="h-12 w-12" />,
        title: 'Sin programas todavia',
        description: 'Crea tu primer programa de entrenamiento para empezar a planificar.',
        action: (
          <Button onClick={handleCreateProgram}>
            <PlusIcon className="h-4 w-4" />
            Crear Programa
          </Button>
        ),
      }

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

      {/* Programs Table with integrated toolbar */}
      <ProgramsTable
        data={programsWithNames}
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? { message: 'Error al cargar programas', retry: refetch } : null}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyState={emptyState}
        onEdit={handleEditProgram}
        onDuplicate={handleDuplicateProgram}
        onArchive={handleArchiveProgram}
      >
        <DataTable.Toolbar>
          <DataTable.Search value={search} onValueChange={handleSearchChange} placeholder="Buscar programas..." />
          <div className="flex items-center gap-4">
            <Select
              items={STATUS_OPTIONS}
              value={statusFilter}
              onValueChange={(v) => {
                if (v) {
                  const parsed = programStatusSchema.safeParse(v)
                  setStatusFilter(parsed.success ? parsed.data : 'all')
                  setPageIndex(0)
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
                  setPageIndex(0)
                }}
              />
              <FieldLabel htmlFor="show-templates" className="font-normal text-sm">
                Solo plantillas
              </FieldLabel>
            </Field>
          </div>
        </DataTable.Toolbar>
      </ProgramsTable>
    </div>
  )
}
