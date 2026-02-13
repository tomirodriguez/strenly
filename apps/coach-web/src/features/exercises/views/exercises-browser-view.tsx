import type { MovementPattern, MuscleGroup } from '@strenly/contracts/exercises/muscle-group'
import { useState } from 'react'
import { ExerciseFilters } from '../components/exercise-filters'
import { ExercisesTable } from '../components/exercises-table'
import { useExercises } from '../hooks/queries/use-exercises'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { DataTableSearch } from '@/components/data-table/data-table-search'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

/**
 * Exercises browser view with search, filters, and pagination
 */
export function ExercisesBrowserView() {
  const [search, setSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | undefined>()
  const [movementPattern, setMovementPattern] = useState<MovementPattern | undefined>()
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(25)

  const { data, isLoading, error, refetch } = useExercises({
    search: search || undefined,
    muscleGroup,
    movementPattern,
    limit: pageSize,
    offset: pageIndex * pageSize,
  })

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageIndex(0)
  }

  const handleMuscleGroupChange = (value: MuscleGroup | undefined) => {
    setMuscleGroup(value)
    setPageIndex(0)
  }

  const handleMovementPatternChange = (value: MovementPattern | undefined) => {
    setMovementPattern(value)
    setPageIndex(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-3xl tracking-tight">Ejercicios</h1>
          <p className="text-muted-foreground text-sm">Explora y gestiona tu biblioteca de ejercicios</p>
        </div>
      </div>

      <div className="space-y-4">
        <DataTableToolbar>
          <div className="flex flex-1 items-center gap-4">
            <DataTableSearch value={search} onValueChange={handleSearchChange} placeholder="Buscar ejercicios..." />
            <ExerciseFilters
              muscleGroup={muscleGroup}
              movementPattern={movementPattern}
              onMuscleGroupChange={handleMuscleGroupChange}
              onMovementPatternChange={handleMovementPatternChange}
            />
          </div>
        </DataTableToolbar>

        <ExercisesTable
          data={data?.items ?? []}
          totalCount={data?.totalCount ?? 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          error={error ? { message: 'Error al cargar ejercicios', retry: refetch } : null}
        >
          <DataTablePagination />
        </ExercisesTable>
      </div>
    </div>
  )
}
