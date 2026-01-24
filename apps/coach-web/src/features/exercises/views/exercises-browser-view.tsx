import type { MovementPattern, MuscleGroup } from '@strenly/contracts/exercises/muscle-group'
import { useEffect, useState } from 'react'
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

  const { data, isLoading } = useExercises({
    search: search || undefined,
    muscleGroup,
    movementPattern,
    limit: pageSize,
    offset: pageIndex * pageSize,
  })

  // Reset page to 0 when filters change
  useEffect(() => {
    setPageIndex(0)
  }, [])

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-3xl tracking-tight">Exercises</h1>
          <p className="text-muted-foreground text-sm">Browse and manage your exercise library</p>
        </div>
      </div>

      <div className="space-y-4">
        <DataTableToolbar>
          <div className="flex flex-1 items-center gap-4">
            <DataTableSearch value={search} onValueChange={setSearch} placeholder="Search exercises..." />
            <ExerciseFilters
              muscleGroup={muscleGroup}
              movementPattern={movementPattern}
              onMuscleGroupChange={setMuscleGroup}
              onMovementPatternChange={setMovementPattern}
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
        >
          <DataTablePagination />
        </ExercisesTable>
      </div>
    </div>
  )
}
