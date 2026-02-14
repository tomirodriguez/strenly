/**
 * Log Store - Zustand store for workout log editing
 *
 * Manages client-side log editing state with dirty tracking.
 * Similar pattern to grid-store for programs.
 *
 * The store holds the WorkoutLogAggregate and provides actions
 * for updating series, skipping exercises, and session data.
 */

import type { SaveLogInput } from '@strenly/contracts/workout-logs/save-log'
import type {
  LoggedExerciseInput,
  LoggedSeriesInput,
  WorkoutLogAggregate,
} from '@strenly/contracts/workout-logs/workout-log'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// ============================================================================
// Types
// ============================================================================

/**
 * Series update data - partial update for a specific series
 */
interface SeriesUpdateData {
  repsPerformed?: number | null
  weightUsed?: number | null
  rpe?: number | null
  skipped?: boolean
}

/**
 * Session update data - session-level RPE and notes
 */
interface SessionUpdateData {
  sessionRpe?: number | null
  sessionNotes?: string | null
}

/**
 * Log state interface
 */
interface LogState {
  // The workout log aggregate (source of truth)
  log: WorkoutLogAggregate | null

  // Dirty tracking - true if there are unsaved changes
  isDirty: boolean
}

/**
 * Log actions interface
 */
interface LogActions {
  // Initialize store with log data, clear dirty flag
  initialize: (log: WorkoutLogAggregate) => void

  // Update a specific series within an exercise
  updateSeries: (exerciseId: string, seriesIndex: number, data: SeriesUpdateData) => void

  // Mark exercise and all its series as skipped
  skipExercise: (exerciseId: string) => void

  // Restore exercise to not skipped (unskip all series too)
  unskipExercise: (exerciseId: string) => void

  // Update exercise notes
  updateExerciseNotes: (exerciseId: string, notes: string | null) => void

  // Update session-level data (RPE, notes)
  updateSession: (data: SessionUpdateData) => void

  // Get data formatted for save API
  getLogForSave: () => SaveLogInput | null

  // Clear dirty flag (called after successful save)
  markSaved: () => void

  // Clear store state
  reset: () => void
}

type LogStore = LogState & LogActions

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Deep clone an object for immutable updates
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ============================================================================
// Store
// ============================================================================

/**
 * Zustand store for workout log editing
 */
export const useLogStore = create<LogStore>((set, get) => ({
  // Initial state
  log: null,
  isDirty: false,

  // Initialize store with log data
  initialize: (log) => {
    set({
      log: deepClone(log),
      isDirty: false,
    })
  },

  // Update a specific series
  updateSeries: (exerciseId, seriesIndex, data) =>
    set((state) => {
      if (!state.log) return state

      const newLog = deepClone(state.log)
      const exercise = newLog.exercises.find((ex) => ex.id === exerciseId)
      if (!exercise) return state

      const series = exercise.series[seriesIndex]
      if (!series) return state

      // Apply updates
      if (data.repsPerformed !== undefined) {
        series.repsPerformed = data.repsPerformed
      }
      if (data.weightUsed !== undefined) {
        series.weightUsed = data.weightUsed
      }
      if (data.rpe !== undefined) {
        series.rpe = data.rpe
      }
      if (data.skipped !== undefined) {
        series.skipped = data.skipped
      }

      return {
        log: newLog,
        isDirty: true,
      }
    }),

  // Skip an exercise and all its series
  skipExercise: (exerciseId) =>
    set((state) => {
      if (!state.log) return state

      const newLog = deepClone(state.log)
      const exercise = newLog.exercises.find((ex) => ex.id === exerciseId)
      if (!exercise) return state

      // Mark exercise as skipped
      exercise.skipped = true

      // Mark all series as skipped
      for (const series of exercise.series) {
        series.skipped = true
      }

      return {
        log: newLog,
        isDirty: true,
      }
    }),

  // Unskip an exercise and all its series
  unskipExercise: (exerciseId) =>
    set((state) => {
      if (!state.log) return state

      const newLog = deepClone(state.log)
      const exercise = newLog.exercises.find((ex) => ex.id === exerciseId)
      if (!exercise) return state

      // Mark exercise as not skipped
      exercise.skipped = false

      // Mark all series as not skipped
      for (const series of exercise.series) {
        series.skipped = false
      }

      return {
        log: newLog,
        isDirty: true,
      }
    }),

  // Update exercise notes
  updateExerciseNotes: (exerciseId, notes) =>
    set((state) => {
      if (!state.log) return state

      const newLog = deepClone(state.log)
      const exercise = newLog.exercises.find((ex) => ex.id === exerciseId)
      if (!exercise) return state

      exercise.notes = notes

      return {
        log: newLog,
        isDirty: true,
      }
    }),

  // Update session data
  updateSession: (data) =>
    set((state) => {
      if (!state.log) return state

      const newLog = deepClone(state.log)

      if (data.sessionRpe !== undefined) {
        newLog.sessionRpe = data.sessionRpe
      }
      if (data.sessionNotes !== undefined) {
        newLog.sessionNotes = data.sessionNotes
      }

      return {
        log: newLog,
        isDirty: true,
      }
    }),

  // Get log data formatted for save API
  getLogForSave: () => {
    const state = get()
    if (!state.log) return null

    const { log } = state

    // Map exercises to input format
    const exercises: LoggedExerciseInput[] = log.exercises.map((ex) => {
      const series: LoggedSeriesInput[] = ex.series.map((s) => ({
        repsPerformed: s.repsPerformed,
        weightUsed: s.weightUsed,
        rpe: s.rpe,
        skipped: s.skipped,
        prescribedReps: s.prescribedReps,
        prescribedWeight: s.prescribedWeight,
        // Extended prescription snapshot
        prescribedRepsMax: s.prescribedRepsMax,
        prescribedIsAmrap: s.prescribedIsAmrap,
        prescribedIntensityType: s.prescribedIntensityType,
        prescribedIntensityValue: s.prescribedIntensityValue,
        prescribedTempo: s.prescribedTempo,
        prescribedRestSeconds: s.prescribedRestSeconds,
      }))

      return {
        id: ex.id,
        exerciseId: ex.exerciseId,
        groupItemId: ex.groupItemId,
        orderIndex: ex.orderIndex,
        notes: ex.notes,
        skipped: ex.skipped,
        series,
        // Group display info
        groupLabel: ex.groupLabel,
        groupOrder: ex.groupOrder,
      }
    })

    return {
      id: log.id,
      athleteId: log.athleteId,
      programId: log.programId,
      sessionId: log.sessionId,
      weekId: log.weekId,
      logDate: log.logDate,
      sessionRpe: log.sessionRpe,
      sessionNotes: log.sessionNotes,
      exercises,
    }
  },

  // Mark as saved (clear dirty flag)
  markSaved: () => set({ isDirty: false }),

  // Reset store
  reset: () =>
    set({
      log: null,
      isDirty: false,
    }),
}))

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Get the log data
 */
export const useLogData = () => useLogStore((state) => state.log)

/**
 * Get the dirty flag
 */
export const useLogIsDirty = () => useLogStore((state) => state.isDirty)

/**
 * Get all actions using useShallow for stable references
 */
export const useLogActions = () =>
  useLogStore(
    useShallow((state) => ({
      initialize: state.initialize,
      updateSeries: state.updateSeries,
      skipExercise: state.skipExercise,
      unskipExercise: state.unskipExercise,
      updateExerciseNotes: state.updateExerciseNotes,
      updateSession: state.updateSession,
      getLogForSave: state.getLogForSave,
      markSaved: state.markSaved,
      reset: state.reset,
    })),
  )
