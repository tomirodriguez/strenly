import { formatSeriesToNotation, type PrescriptionSeriesInput } from '@strenly/contracts/programs/prescription'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { recalculateSessionGroups } from '@/components/programs/program-grid/transform-program'
import type { GridData, GridRow } from '@/components/programs/program-grid/types'

/**
 * Tracked prescription change for bulk save
 */
interface PrescriptionChange {
  exerciseRowId: string
  weekId: string
  series: PrescriptionSeriesInput[]
}

/**
 * Tracked exercise row change for bulk save
 */
interface ExerciseRowChange {
  rowId: string
  exerciseId: string
}

/**
 * Grid state interface
 */
interface GridState {
  // Data
  data: GridData | null
  programId: string | null

  // Dirty tracking
  isDirty: boolean
  lastLoadedAt: Date | null

  // Change tracking for efficient save
  changedPrescriptions: Map<string, PrescriptionChange>
  changedExerciseRows: Map<string, ExerciseRowChange>
}

/**
 * Grid actions interface
 */
interface GridActions {
  // Initialize store with program data
  initialize: (programId: string, data: GridData) => void

  // Update a prescription (series array)
  updatePrescription: (exerciseRowId: string, weekId: string, series: PrescriptionSeriesInput[]) => void

  // Update an exercise selection
  updateExercise: (rowId: string, exerciseId: string, exerciseName: string) => void

  // Add a new exercise row to a session (local-only, not persisted by saveDraft)
  addExercise: (sessionId: string, exerciseId: string, exerciseName: string) => void

  // Update a row's superset group (letters A, B, C - local only)
  updateSupersetGroup: (rowId: string, groupLetter: string | null) => void

  // Reset to server state (e.g., after refetch)
  reset: (data: GridData) => void

  // Mark as saved (clear dirty flag and changes)
  markSaved: () => void

  // Get accumulated changes for save operation
  getChanges: () => {
    prescriptions: PrescriptionChange[]
    exerciseRows: ExerciseRowChange[]
    lastLoadedAt: Date | null
  }
}

type GridStore = GridState & GridActions

/**
 * Zustand store for program grid state
 *
 * Enables 100% client-side editing with explicit "Guardar" save action.
 * All prescription edits update local state without API calls.
 */
export const useGridStore = create<GridStore>((set, get) => ({
  // Initial state
  data: null,
  programId: null,
  isDirty: false,
  lastLoadedAt: null,
  changedPrescriptions: new Map(),
  changedExerciseRows: new Map(),

  // Actions
  initialize: (programId, data) =>
    set({
      programId,
      data,
      isDirty: false,
      lastLoadedAt: new Date(),
      changedPrescriptions: new Map(),
      changedExerciseRows: new Map(),
    }),

  updatePrescription: (exerciseRowId, weekId, series) =>
    set((state) => {
      if (!state.data) return state

      // Find and update the row immutably
      const updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise' && row.id === exerciseRowId) {
          const notationDisplay = formatSeriesToNotation(series)
          return {
            ...row,
            prescriptions: {
              ...row.prescriptions,
              [weekId]: notationDisplay,
            },
          }
        }
        return row
      })

      // Track the change
      const key = `${exerciseRowId}:${weekId}`
      const newChangedPrescriptions = new Map(state.changedPrescriptions)
      newChangedPrescriptions.set(key, { exerciseRowId, weekId, series })

      return {
        data: { ...state.data, rows: updatedRows },
        isDirty: true,
        changedPrescriptions: newChangedPrescriptions,
      }
    }),

  updateExercise: (rowId, exerciseId, exerciseName) =>
    set((state) => {
      if (!state.data) return state

      // Find and update the row immutably
      const updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise' && row.id === rowId && row.exercise) {
          return {
            ...row,
            exercise: {
              ...row.exercise,
              exerciseId,
              exerciseName,
            },
          }
        }
        return row
      })

      // Track the change
      const newChangedExerciseRows = new Map(state.changedExerciseRows)
      newChangedExerciseRows.set(rowId, { rowId, exerciseId })

      return {
        data: { ...state.data, rows: updatedRows },
        isDirty: true,
        changedExerciseRows: newChangedExerciseRows,
      }
    }),

  /**
   * Add a new exercise row to a session (local-only).
   *
   * NOTE: This is a known limitation - the row appears locally but saveDraft
   * does NOT persist new exercises. Full structural changes require backend
   * extension in a future phase. On save/refresh, only prescription and
   * exercise row updates are persisted.
   */
  addExercise: (sessionId, exerciseId, exerciseName) =>
    set((state) => {
      if (!state.data) return state

      const tempId = `temp-row-${Date.now()}`

      // Get all week IDs for creating empty prescriptions
      const weekIds = state.data.columns
        .filter((col) => col.type === 'week' && col.weekId)
        .map((col) => col.weekId as string)

      // Create empty prescriptions map
      const prescriptions: Record<string, string> = {}
      for (const weekId of weekIds) {
        prescriptions[weekId] = ''
      }

      // Find the session's existing exercise rows to determine position
      const sessionRows = state.data.rows.filter((row) => row.type === 'exercise' && row.sessionId === sessionId)
      const orderIndex = sessionRows.length

      // Find session name from an existing row in this session
      const sessionRow = state.data.rows.find((row) => row.sessionId === sessionId)
      const sessionName = sessionRow?.sessionName ?? ''

      // Create new row
      const newRow: GridRow = {
        id: tempId,
        type: 'exercise',
        sessionId,
        sessionName,
        exercise: {
          exerciseId,
          exerciseName,
          position: orderIndex,
        },
        supersetGroup: null,
        supersetOrder: null,
        supersetPosition: null,
        groupLetter: undefined, // Will be calculated on next transform
        groupIndex: undefined,
        isSubRow: false,
        parentRowId: null,
        setTypeLabel: null,
        prescriptions,
      }

      // Find where to insert (before the add-exercise row for this session)
      const insertIndex = state.data.rows.findIndex((row) => row.type === 'add-exercise' && row.sessionId === sessionId)

      const updatedRows = [...state.data.rows]
      if (insertIndex >= 0) {
        updatedRows.splice(insertIndex, 0, newRow)
      } else {
        // Fallback: add at end
        updatedRows.push(newRow)
      }

      // Recalculate group labels for this session
      const sessionExerciseRows = updatedRows.filter((row) => row.type === 'exercise' && row.sessionId === sessionId)
      const recalculatedRows = recalculateSessionGroups(sessionExerciseRows)
      const recalculatedMap = new Map(recalculatedRows.map((row) => [row.id, row]))

      const finalRows = updatedRows.map((row) => {
        const recalculated = recalculatedMap.get(row.id)
        return recalculated ?? row
      })

      return {
        data: { ...state.data, rows: finalRows },
        isDirty: true,
        // NOTE: We intentionally do NOT add to a tracking array here
        // because saveDraft backend does not yet support persisting new exercises.
        // This is a known limitation - the row appears locally but won't survive save/refresh.
      }
    }),

  /**
   * Update a row's superset group (local-only).
   *
   * NOTE: This updates local state only. The saveDraft endpoint does NOT
   * currently persist superset groups - that's a known limitation for a
   * future phase. The groupLetter is stored for visual display.
   */
  updateSupersetGroup: (rowId, groupLetter) =>
    set((state) => {
      if (!state.data) return state

      // Find the row to get its sessionId
      const targetRow = state.data.rows.find((row) => row.type === 'exercise' && row.id === rowId)
      if (!targetRow) return state
      const sessionId = targetRow.sessionId

      // First, update the target row's supersetGroup
      let updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise' && row.id === rowId) {
          return {
            ...row,
            supersetGroup: groupLetter,
          }
        }
        return row
      })

      // Get all exercise rows for this session (in order)
      const sessionExerciseRows = updatedRows.filter((row) => row.type === 'exercise' && row.sessionId === sessionId)

      // Recalculate group labels for entire session
      const recalculatedRows = recalculateSessionGroups(sessionExerciseRows)

      // Create a map for quick lookup
      const recalculatedMap = new Map(recalculatedRows.map((row) => [row.id, row]))

      // Merge recalculated rows back
      updatedRows = updatedRows.map((row) => {
        const recalculated = recalculatedMap.get(row.id)
        return recalculated ?? row
      })

      return {
        data: { ...state.data, rows: updatedRows },
        isDirty: true,
      }
    }),

  reset: (data) =>
    set({
      data,
      isDirty: false,
      lastLoadedAt: new Date(),
      changedPrescriptions: new Map(),
      changedExerciseRows: new Map(),
    }),

  markSaved: () =>
    set({
      isDirty: false,
      changedPrescriptions: new Map(),
      changedExerciseRows: new Map(),
    }),

  getChanges: () => {
    const state = get()
    return {
      prescriptions: Array.from(state.changedPrescriptions.values()),
      exerciseRows: Array.from(state.changedExerciseRows.values()),
      lastLoadedAt: state.lastLoadedAt,
    }
  },
}))

/**
 * Selector hooks for common patterns
 */
export const useGridData = () => useGridStore((state) => state.data)
export const useGridIsDirty = () => useGridStore((state) => state.isDirty)
export const useGridActions = () =>
  useGridStore(
    useShallow((state) => ({
      initialize: state.initialize,
      updatePrescription: state.updatePrescription,
      updateExercise: state.updateExercise,
      addExercise: state.addExercise,
      updateSupersetGroup: state.updateSupersetGroup,
      reset: state.reset,
      markSaved: state.markSaved,
      getChanges: state.getChanges,
    })),
  )
