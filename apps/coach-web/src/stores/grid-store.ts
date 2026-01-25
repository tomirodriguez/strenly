import { create } from 'zustand'
import type { GridData } from '@/components/programs/program-grid/types'
import {
  formatSeriesToNotation,
  type PrescriptionSeriesInput,
} from '@strenly/contracts/programs/prescription'

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
  updatePrescription: (
    exerciseRowId: string,
    weekId: string,
    series: PrescriptionSeriesInput[]
  ) => void

  // Update an exercise selection
  updateExercise: (rowId: string, exerciseId: string, exerciseName: string) => void

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
  useGridStore((state) => ({
    initialize: state.initialize,
    updatePrescription: state.updatePrescription,
    updateExercise: state.updateExercise,
    reset: state.reset,
    markSaved: state.markSaved,
    getChanges: state.getChanges,
  }))
