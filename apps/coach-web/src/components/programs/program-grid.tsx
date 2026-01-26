import {
  formatPrescription,
  type ParsedPrescription,
  parsePrescriptionNotation,
} from '@strenly/contracts/programs/prescription'
import type { ProgramWeek, ProgramWithDetails } from '@strenly/contracts/programs/program'
import { type Column, DataSheetGrid } from '@wasback/react-datasheet-grid'
import '@wasback/react-datasheet-grid/dist/style.css'
import { SearchIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AddExerciseRow } from './add-exercise-row'
import { ExerciseRowActions, type SessionRowData } from './exercise-row-actions'
import { SplitRowDialog } from './split-row-dialog'
import { WeekActionsMenu } from './week-actions-menu'
import { useExercises } from '@/features/exercises/hooks/queries/use-exercises'
import {
  useToggleSuperset,
  useUpdateExerciseRow,
  useUpdatePrescription,
} from '@/features/programs/hooks/mutations/use-grid-mutations'
import { useProgram } from '@/features/programs/hooks/queries/use-program'
import { cn } from '@/lib/utils'

/**
 * Exercise data for cells
 */
interface ExerciseCell {
  exerciseId: string
  exerciseName: string
}

/**
 * Row type for the flattened grid representation
 * The grid uses a flat structure with session headers as special rows
 */
interface GridRow {
  id: string
  type: 'session-header' | 'exercise'
  sessionId: string
  sessionName?: string
  exercise: ExerciseCell
  rowId?: string
  isSubRow?: boolean
  supersetGroup?: string | null
  supersetOrder?: number | null
  setTypeLabel?: string | null
  prescriptions: Record<string, ParsedPrescription | null>
}

interface ProgramGridProps {
  programId: string
}

/**
 * Loading skeleton for the program grid
 */
function GridSkeleton() {
  return (
    <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-muted/30">
      <div className="text-muted-foreground">Cargando programa...</div>
    </div>
  )
}

/**
 * Error state for the program grid
 */
function GridError({ message }: { message: string }) {
  return (
    <div className="flex h-96 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="text-destructive">{message}</div>
    </div>
  )
}

/**
 * Transform ProgramWithDetails to flat grid rows
 */
function transformToGridRows(program: ProgramWithDetails): GridRow[] {
  const rows: GridRow[] = []

  for (const session of program.sessions) {
    // Add session header row
    rows.push({
      id: `header-${session.id}`,
      type: 'session-header',
      sessionId: session.id,
      sessionName: session.name,
      exercise: { exerciseId: '', exerciseName: '' },
      prescriptions: {},
    })

    // Add exercise rows for this session
    for (const row of session.rows) {
      const prescriptions: Record<string, ParsedPrescription | null> = {}
      for (const [weekId, rx] of Object.entries(row.prescriptionsByWeekId)) {
        prescriptions[weekId] = {
          sets: rx.sets,
          repsMin: rx.repsMin,
          repsMax: rx.repsMax,
          isAmrap: rx.isAmrap,
          isUnilateral: rx.isUnilateral,
          unilateralUnit: rx.unilateralUnit,
          intensityType: rx.intensityType,
          intensityValue: rx.intensityValue,
          intensityUnit:
            rx.intensityType === 'absolute'
              ? rx.intensityValue !== null
                ? 'kg'
                : null
              : rx.intensityType === 'percentage'
                ? '%'
                : rx.intensityType,
          tempo: rx.tempo,
        }
      }

      rows.push({
        id: row.id,
        type: 'exercise',
        sessionId: session.id,
        rowId: row.id,
        exercise: {
          exerciseId: row.exerciseId,
          exerciseName: row.exerciseName,
        },
        isSubRow: row.isSubRow,
        supersetGroup: row.supersetGroup,
        supersetOrder: row.supersetOrder,
        setTypeLabel: row.setTypeLabel,
        prescriptions,
      })

      // Add sub-rows (split rows)
      for (const subRow of row.subRows ?? []) {
        const subPrescriptions: Record<string, ParsedPrescription | null> = {}
        for (const [weekId, rx] of Object.entries(subRow.prescriptionsByWeekId)) {
          subPrescriptions[weekId] = {
            sets: rx.sets,
            repsMin: rx.repsMin,
            repsMax: rx.repsMax,
            isAmrap: rx.isAmrap,
            isUnilateral: rx.isUnilateral,
            unilateralUnit: rx.unilateralUnit,
            intensityType: rx.intensityType,
            intensityValue: rx.intensityValue,
            intensityUnit:
              rx.intensityType === 'absolute'
                ? rx.intensityValue !== null
                  ? 'kg'
                  : null
                : rx.intensityType === 'percentage'
                  ? '%'
                  : rx.intensityType,
            tempo: rx.tempo,
          }
        }

        rows.push({
          id: subRow.id,
          type: 'exercise',
          sessionId: session.id,
          rowId: subRow.id,
          exercise: {
            exerciseId: subRow.exerciseId,
            exerciseName: subRow.exerciseName,
          },
          isSubRow: true,
          supersetGroup: subRow.supersetGroup,
          supersetOrder: subRow.supersetOrder,
          setTypeLabel: subRow.setTypeLabel,
          prescriptions: subPrescriptions,
        })
      }
    }
  }

  return rows
}

/**
 * Exercise cell component with inline search
 */
function ExerciseCellComponent({
  rowData,
  setRowData,
  focus,
  stopEditing,
  active,
}: {
  rowData: GridRow
  setRowData: (value: GridRow) => void
  focus: boolean
  stopEditing: (opts?: { nextRow?: boolean }) => void
  active: boolean
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { data: exercisesData } = useExercises({
    search: searchTerm.length > 0 ? searchTerm : undefined,
    limit: 10,
  })

  const exercises = exercisesData?.items ?? []

  useEffect(() => {
    if (focus) {
      inputRef.current?.focus()
      setSearchTerm(rowData.exercise.exerciseName)
      setIsOpen(true)
      setHighlightedIndex(0)
    } else {
      setIsOpen(false)
    }
  }, [focus, rowData.exercise.exerciseName])

  const handleSelect = (exerciseId: string, exerciseName: string) => {
    setRowData({ ...rowData, exercise: { exerciseId, exerciseName } })
    setSearchTerm(exerciseName)
    setIsOpen(false)
    stopEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.min(prev + 1, exercises.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (exercises[highlightedIndex]) {
          handleSelect(exercises[highlightedIndex].id, exercises[highlightedIndex].name)
        }
        break
      case 'Escape':
        e.preventDefault()
        setSearchTerm(rowData.exercise.exerciseName)
        setIsOpen(false)
        stopEditing()
        break
      case 'Tab':
        if (exercises[highlightedIndex]) {
          handleSelect(exercises[highlightedIndex].id, exercises[highlightedIndex].name)
        } else {
          stopEditing()
        }
        break
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (listRef.current?.contains(relatedTarget)) {
      return
    }
    setIsOpen(false)
    if (!exercises.find((ex) => ex.name === searchTerm)) {
      setSearchTerm(rowData.exercise.exerciseName)
    }
    stopEditing()
  }

  // Session header display
  if (rowData.type === 'session-header') {
    return (
      <div className="flex h-full w-full items-center bg-muted/50 px-3 font-medium text-sm">{rowData.sessionName}</div>
    )
  }

  const prefix = rowData.supersetGroup ? `${rowData.supersetGroup}${rowData.supersetOrder ?? ''}` : ''

  // Display mode
  if (!focus) {
    return (
      <div className={cn('flex h-full w-full items-center gap-2 px-2 text-sm', active && 'bg-primary/5')}>
        {prefix && <span className="font-semibold text-primary">{prefix}</span>}
        <span className={cn(rowData.isSubRow && 'text-muted-foreground')}>
          {rowData.exercise.exerciseName || 'Seleccionar ejercicio'}
        </span>
        {rowData.setTypeLabel && (
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-muted-foreground text-xs">
            {rowData.setTypeLabel}
          </span>
        )}
      </div>
    )
  }

  // Edit mode
  return (
    <div className="relative h-full w-full">
      <div className="flex h-full items-center gap-1 px-2">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Buscar ejercicio..."
        />
      </div>

      {isOpen && exercises.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 z-50 mt-1 max-h-48 w-64 overflow-auto rounded-md border border-border bg-popover shadow-md"
        >
          {exercises.map((exercise, index) => (
            <button
              key={exercise.id}
              type="button"
              className={cn(
                'flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                index === highlightedIndex && 'bg-accent text-accent-foreground',
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(exercise.id, exercise.name)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="flex-1 truncate">{exercise.name}</span>
              {exercise.isCurated && <span className="ml-2 text-muted-foreground text-xs">Curado</span>}
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm.length > 0 && exercises.length === 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-md border border-border bg-popover p-3 text-center text-muted-foreground text-sm shadow-md">
          No se encontraron ejercicios
        </div>
      )}
    </div>
  )
}

/**
 * Prescription cell component
 */
function PrescriptionCellComponent({
  rowData,
  setRowData,
  focus,
  stopEditing,
  active,
  weekId,
}: {
  rowData: GridRow
  setRowData: (value: GridRow) => void
  focus: boolean
  stopEditing: (opts?: { nextRow?: boolean }) => void
  active: boolean
  weekId: string
}) {
  const prescription = rowData.prescriptions[weekId] ?? null
  const [inputValue, setInputValue] = useState(prescription ? formatPrescription(prescription) : '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focus) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [focus])

  useEffect(() => {
    if (!focus) {
      setInputValue(prescription ? formatPrescription(prescription) : '')
    }
  }, [prescription, focus])

  const handleBlur = () => {
    const parsed = parsePrescriptionNotation(inputValue)
    setRowData({
      ...rowData,
      prescriptions: {
        ...rowData.prescriptions,
        [weekId]: parsed,
      },
    })
    stopEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      handleBlur()
    }
    if (e.key === 'Escape') {
      setInputValue(prescription ? formatPrescription(prescription) : '')
      stopEditing()
    }
  }

  // Session header - empty
  if (rowData.type === 'session-header') {
    return <div className="h-full w-full bg-muted/50" />
  }

  return (
    <input
      ref={inputRef}
      className={cn(
        'h-full w-full bg-transparent px-2 text-sm outline-none',
        'placeholder:text-muted-foreground/50',
        active && 'bg-primary/5',
      )}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder="3x8@RIR2"
    />
  )
}

/**
 * Week column header component with actions menu
 */
function WeekColumnHeader({
  programId,
  week,
  isLastWeek,
}: {
  programId: string
  week: ProgramWeek
  isLastWeek: boolean
}) {
  return (
    <div className="flex w-full items-center justify-between px-2 py-1">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{week.name}</span>
      <WeekActionsMenu programId={programId} weekId={week.id} weekName={week.name} isLastWeek={isLastWeek} />
    </div>
  )
}

/**
 * Build columns for the grid based on program weeks
 */
function buildColumns(weeks: ProgramWeek[], programId: string): Column<GridRow>[] {
  // Exercise column
  const exerciseCol: Column<GridRow> = {
    id: 'exercise',
    title: 'Ejercicio',
    component: ExerciseCellComponent,
    deleteValue: ({ rowData }) => ({
      ...rowData,
      exercise: { exerciseId: '', exerciseName: '' },
    }),
    copyValue: ({ rowData }) => rowData.exercise.exerciseName,
    pasteValue: ({ rowData, value }) => ({
      ...rowData,
      exercise: { exerciseId: '', exerciseName: value },
    }),
    minWidth: 250,
    isCellEmpty: ({ rowData }) => rowData.type === 'session-header' || !rowData.exercise.exerciseId,
  }

  const isLastWeek = weeks.length === 1

  // Week columns (prescription cells)
  const weekCols: Column<GridRow>[] = weeks.map((week) => ({
    id: week.id,
    title: week.name,
    headerClassName: 'week-column-header',
    component: (props) => <PrescriptionCellComponent {...props} weekId={week.id} />,
    headerComponent: () => <WeekColumnHeader programId={programId} week={week} isLastWeek={isLastWeek} />,
    deleteValue: ({ rowData }) => ({
      ...rowData,
      prescriptions: {
        ...rowData.prescriptions,
        [week.id]: null,
      },
    }),
    copyValue: ({ rowData }) => {
      const rx = rowData.prescriptions[week.id]
      return rx ? formatPrescription(rx) : ''
    },
    pasteValue: ({ rowData, value }) => ({
      ...rowData,
      prescriptions: {
        ...rowData.prescriptions,
        [week.id]: parsePrescriptionNotation(value),
      },
    }),
    minWidth: 120,
    isCellEmpty: ({ rowData }) => rowData.type === 'session-header' || !rowData.prescriptions[week.id],
  }))

  return [exerciseCol, ...weekCols]
}

/**
 * Convert ParsedPrescription to notation string for API call
 */
function prescriptionToNotation(rx: ParsedPrescription): string {
  let notation = `${rx.sets}x`

  if (rx.isAmrap) {
    notation += 'AMRAP'
  } else {
    notation += rx.repsMin.toString()
    if (rx.repsMax !== null && rx.repsMax !== rx.repsMin) {
      notation += `-${rx.repsMax}`
    }
  }

  if (rx.isUnilateral && rx.unilateralUnit) {
    notation += `/${rx.unilateralUnit}`
  }

  if (rx.intensityType && rx.intensityValue !== null) {
    switch (rx.intensityType) {
      case 'absolute':
        notation += `@${rx.intensityValue}${rx.intensityUnit ?? 'kg'}`
        break
      case 'percentage':
        notation += `@${rx.intensityValue}%`
        break
      case 'rir':
        notation += `@RIR${rx.intensityValue}`
        break
      case 'rpe':
        notation += `@RPE${rx.intensityValue}`
        break
    }
  }

  if (rx.tempo) {
    notation += ` (${rx.tempo})`
  }

  return notation
}

/**
 * Main program grid component using react-datasheet-grid
 * Transforms program data to a flat row structure for Excel-like editing
 *
 * Keyboard shortcuts:
 * - Shift+Enter: Add split row (same exercise, different config)
 * - S: Toggle superset grouping
 */
export function ProgramGrid({ programId }: ProgramGridProps) {
  const { data: program, isLoading, error } = useProgram(programId)
  const updatePrescription = useUpdatePrescription(programId)
  const updateExerciseRow = useUpdateExerciseRow(programId)
  const toggleSuperset = useToggleSuperset(programId)

  // Track selected row for keyboard operations
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [splitDialogOpen, setSplitDialogOpen] = useState(false)
  const [splitParentRowId, setSplitParentRowId] = useState<string | null>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)

  // Transform program data to grid rows
  const rows = useMemo(() => {
    if (!program) return []
    return transformToGridRows(program)
  }, [program])

  // Build session row IDs map for reordering
  const sessionRowIdsMap = useMemo(() => {
    if (!program) return new Map<string, string[]>()
    const map = new Map<string, string[]>()
    for (const session of program.sessions) {
      const rowIds = session.rows.map((row) => row.id)
      map.set(session.id, rowIds)
    }
    return map
  }, [program])

  // Build session rows map for superset group calculations
  const sessionRowsMap = useMemo(() => {
    if (!program) return new Map<string, SessionRowData[]>()
    const map = new Map<string, SessionRowData[]>()
    for (const session of program.sessions) {
      const sessionRowData: SessionRowData[] = session.rows.map((row) => ({
        id: row.id,
        supersetGroup: row.supersetGroup ?? null,
      }))
      map.set(session.id, sessionRowData)
    }
    return map
  }, [program])

  // Get selected row data for actions
  const selectedRowData = useMemo(() => {
    if (!selectedRowId) return null
    return rows.find((r) => r.rowId === selectedRowId) ?? null
  }, [rows, selectedRowId])

  // Build columns based on weeks
  const columns = useMemo(() => {
    if (!program) return []
    return buildColumns(program.weeks, programId)
  }, [program, programId])

  // Handle cell changes
  const handleChange = useCallback(
    (newRows: GridRow[], operations: Array<{ type: string; fromRowIndex: number; toRowIndex: number }>) => {
      for (const op of operations) {
        if (op.type === 'UPDATE') {
          const newRow = newRows[op.fromRowIndex]
          const oldRow = rows[op.fromRowIndex]

          // Skip session header rows
          if (newRow.type === 'session-header' || !newRow.rowId) continue

          // Check if exercise changed
          if (newRow.exercise.exerciseId !== oldRow.exercise.exerciseId) {
            updateExerciseRow.mutate({
              rowId: newRow.rowId,
              exerciseId: newRow.exercise.exerciseId,
            })
            continue
          }

          // Check if any prescription changed
          for (const [weekId, newPrescription] of Object.entries(newRow.prescriptions)) {
            const oldPrescription = oldRow.prescriptions[weekId]
            if (JSON.stringify(newPrescription) !== JSON.stringify(oldPrescription)) {
              if (newPrescription) {
                updatePrescription.mutate({
                  exerciseRowId: newRow.rowId,
                  weekId,
                  notation: prescriptionToNotation(newPrescription),
                })
              }
            }
          }
        }
      }
    },
    [rows, updatePrescription, updateExerciseRow],
  )

  // Track active cell/row selection
  const handleActiveCellChange = useCallback(
    ({ cell }: { cell: { row: number; col: number; colId?: string } | null }) => {
      if (cell !== null && rows[cell.row]) {
        const gridRow = rows[cell.row]
        if (gridRow.type === 'exercise' && gridRow.rowId) {
          setSelectedRowId(gridRow.rowId)
        } else {
          setSelectedRowId(null)
        }
      } else {
        setSelectedRowId(null)
      }
    },
    [rows],
  )

  // Keyboard event handler for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if grid is focused
      if (!gridContainerRef.current?.contains(document.activeElement)) {
        return
      }

      // Shift+Enter: Add split row
      if (e.shiftKey && e.key === 'Enter' && selectedRowId) {
        e.preventDefault()
        setSplitParentRowId(selectedRowId)
        setSplitDialogOpen(true)
        return
      }

      // S key: Toggle superset (only when not in an input)
      if (e.key === 's' && !e.metaKey && !e.ctrlKey && !e.shiftKey && selectedRowId) {
        const activeElement = document.activeElement
        const isInInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
        if (!isInInput) {
          e.preventDefault()
          const selectedRow = rows.find((r) => r.rowId === selectedRowId)
          if (selectedRow) {
            // Toggle: if has group, remove it. If no group, set to 'A'
            const newGroup = selectedRow.supersetGroup ? null : 'A'
            toggleSuperset.mutate({ rowId: selectedRowId, supersetGroup: newGroup })
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedRowId, rows, toggleSuperset])

  // Custom row styling
  const rowClassName = useCallback(({ rowData }: { rowData: GridRow }) => {
    if (rowData.type === 'session-header') {
      return 'bg-muted/30 font-medium'
    }
    if (rowData.isSubRow) {
      return 'opacity-80'
    }
    if (rowData.supersetGroup) {
      return 'border-l-2 border-l-primary'
    }
    return ''
  }, [])

  if (isLoading) {
    return <GridSkeleton />
  }

  if (error) {
    return <GridError message={error.message ?? 'Error al cargar el programa'} />
  }

  if (!program) {
    return <GridError message="Programa no encontrado" />
  }

  // Handler to open split dialog from actions menu
  const handleOpenSplitDialog = (rowId: string) => {
    setSplitParentRowId(rowId)
    setSplitDialogOpen(true)
  }

  return (
    <div className="program-grid flex h-full flex-col" ref={gridContainerRef}>
      {/* Row actions toolbar - appears when a row is selected */}
      {selectedRowData && selectedRowData.rowId && (
        <div className="flex items-center justify-between border-border border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Seleccionado:</span>
            <span className="font-medium">{selectedRowData.exercise.exerciseName || 'Sin ejercicio'}</span>
            {selectedRowData.supersetGroup && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-xs">
                Grupo {selectedRowData.supersetGroup}
              </span>
            )}
          </div>
          <ExerciseRowActions
            programId={programId}
            sessionId={selectedRowData.sessionId}
            rowId={selectedRowData.rowId}
            exerciseName={selectedRowData.exercise.exerciseName}
            supersetGroup={selectedRowData.supersetGroup ?? null}
            isSubRow={selectedRowData.isSubRow}
            sessionRowIds={sessionRowIdsMap.get(selectedRowData.sessionId) ?? []}
            sessionRows={sessionRowsMap.get(selectedRowData.sessionId) ?? []}
            onAddSplitRow={() => handleOpenSplitDialog(selectedRowData.rowId ?? '')}
          />
        </div>
      )}

      {/* Main grid */}
      <div className="min-h-0 flex-1">
        <DataSheetGrid<GridRow>
          value={rows}
          onChange={handleChange}
          columns={columns}
          lockRows
          rowClassName={rowClassName}
          onActiveCellChange={handleActiveCellChange}
          createRow={() => ({
            id: '',
            type: 'exercise',
            sessionId: '',
            exercise: { exerciseId: '', exerciseName: '' },
            prescriptions: {},
          })}
          height={600}
        />
      </div>

      {/* Add exercise rows for each session */}
      <div className="border-border border-t">
        {program.sessions.map((session) => (
          <AddExerciseRow key={session.id} programId={programId} sessionId={session.id} />
        ))}
      </div>

      {/* Split row dialog */}
      <SplitRowDialog
        programId={programId}
        parentRowId={splitParentRowId}
        open={splitDialogOpen}
        onOpenChange={setSplitDialogOpen}
      />

      <style>{`
        .program-grid .dsg-cell {
          border-right: 1px solid hsl(var(--border));
          border-bottom: 1px solid hsl(var(--border));
        }
        .program-grid .dsg-row:has(.bg-muted\\/30) .dsg-cell {
          background-color: hsl(var(--muted) / 0.3);
        }
        .program-grid .dsg-cell-header {
          background-color: hsl(var(--muted));
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

export type { GridRow, ExerciseCell }
