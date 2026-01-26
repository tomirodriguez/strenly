import { formatSeriesToNotation, type PrescriptionSeriesInput } from '@strenly/contracts/programs/prescription'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { recalculateSessionGroups } from '@/components/programs/program-grid/transform-program'
import type { GridColumn, GridData, GridRow } from '@/components/programs/program-grid/types'

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
 * Tracked new week for bulk save
 */
interface NewWeek {
  tempId: string // Client-generated ID (temp-week-xxx)
  name: string
  orderIndex: number
}

/**
 * Tracked new session for bulk save
 */
interface NewSession {
  tempId: string // Client-generated ID (temp-session-xxx)
  name: string
  orderIndex: number
}

/**
 * Tracked new exercise row for bulk save
 */
interface NewExerciseRow {
  tempId: string
  sessionId: string // May be a tempId if session is also new
  exerciseId: string
  orderIndex: number
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

  // Structural change tracking
  newWeeks: Map<string, NewWeek>
  newSessions: Map<string, NewSession>
  newExerciseRows: Map<string, NewExerciseRow>
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

  // Add a new exercise row to a session (tracked for persistence)
  addExercise: (sessionId: string, exerciseId: string, exerciseName: string) => void

  // Add a new week (column) to the program
  addWeek: () => void

  // Add a new session (training day) to the program
  addSession: (name: string) => void

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
    newWeeks: NewWeek[]
    newSessions: NewSession[]
    newExerciseRows: NewExerciseRow[]
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
  newWeeks: new Map(),
  newSessions: new Map(),
  newExerciseRows: new Map(),

  // Actions
  initialize: (programId, data) =>
    set({
      programId,
      data,
      isDirty: false,
      lastLoadedAt: new Date(),
      changedPrescriptions: new Map(),
      changedExerciseRows: new Map(),
      newWeeks: new Map(),
      newSessions: new Map(),
      newExerciseRows: new Map(),
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
   * Add a new exercise row to a session.
   *
   * The row is tracked for persistence via saveDraft.
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

      // Track new exercise row for saveDraft
      const newExerciseRows = new Map(state.newExerciseRows)
      newExerciseRows.set(tempId, {
        tempId,
        sessionId,
        exerciseId,
        orderIndex,
      })

      return {
        data: { ...state.data, rows: finalRows },
        isDirty: true,
        newExerciseRows,
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

  /**
   * Add a new week (column) to the program.
   * Local state only - persisted via saveDraft.
   */
  addWeek: () =>
    set((state) => {
      if (!state.data) return state

      const tempId = `temp-week-${Date.now()}`
      const orderIndex = state.data.columns.filter((c) => c.type === 'week').length
      const name = `Semana ${orderIndex + 1}`

      // Add column to grid data
      const newColumn: GridColumn = {
        id: tempId,
        name,
        type: 'week',
        weekId: tempId,
      }

      // Add empty prescriptions for all exercise rows
      const updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise') {
          return {
            ...row,
            prescriptions: {
              ...row.prescriptions,
              [tempId]: '',
            },
          }
        }
        return row
      })

      // Track the new week
      const newWeeks = new Map(state.newWeeks)
      newWeeks.set(tempId, { tempId, name, orderIndex })

      return {
        data: {
          ...state.data,
          columns: [...state.data.columns, newColumn],
          rows: updatedRows,
        },
        isDirty: true,
        newWeeks,
      }
    }),

  /**
   * Add a new session (training day) to the program.
   * Local state only - persisted via saveDraft.
   */
  addSession: (name: string) =>
    set((state) => {
      if (!state.data) return state

      const tempId = `temp-session-${Date.now()}`

      // Calculate order index (count existing sessions)
      const existingSessionIds = new Set<string>()
      for (const row of state.data.rows) {
        if (row.sessionId) existingSessionIds.add(row.sessionId)
      }
      const orderIndex = existingSessionIds.size

      // Create session header row
      const sessionHeaderRow: GridRow = {
        id: `session-header-${tempId}`,
        type: 'session-header',
        sessionId: tempId,
        sessionName: name,
        supersetGroup: null,
        supersetOrder: null,
        supersetPosition: null,
        isSubRow: false,
        parentRowId: null,
        setTypeLabel: null,
        prescriptions: {},
      }

      // Create add-exercise row for this session
      const addExerciseRow: GridRow = {
        id: `add-exercise-${tempId}`,
        type: 'add-exercise',
        sessionId: tempId,
        sessionName: name,
        supersetGroup: null,
        supersetOrder: null,
        supersetPosition: null,
        isSubRow: false,
        parentRowId: null,
        setTypeLabel: null,
        prescriptions: {},
      }

      // Track the new session
      const newSessions = new Map(state.newSessions)
      newSessions.set(tempId, { tempId, name, orderIndex })

      return {
        data: {
          ...state.data,
          rows: [...state.data.rows, sessionHeaderRow, addExerciseRow],
        },
        isDirty: true,
        newSessions,
      }
    }),

  reset: (data) =>
    set({
      data,
      isDirty: false,
      lastLoadedAt: new Date(),
      changedPrescriptions: new Map(),
      changedExerciseRows: new Map(),
      newWeeks: new Map(),
      newSessions: new Map(),
      newExerciseRows: new Map(),
    }),

  markSaved: () =>
    set({
      isDirty: false,
      changedPrescriptions: new Map(),
      changedExerciseRows: new Map(),
      newWeeks: new Map(),
      newSessions: new Map(),
      newExerciseRows: new Map(),
    }),

  getChanges: () => {
    const state = get()
    return {
      prescriptions: Array.from(state.changedPrescriptions.values()),
      exerciseRows: Array.from(state.changedExerciseRows.values()),
      newWeeks: Array.from(state.newWeeks.values()),
      newSessions: Array.from(state.newSessions.values()),
      newExerciseRows: Array.from(state.newExerciseRows.values()),
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
      addWeek: state.addWeek,
      addSession: state.addSession,
      updateSupersetGroup: state.updateSupersetGroup,
      reset: state.reset,
      markSaved: state.markSaved,
      getChanges: state.getChanges,
    })),
  )
