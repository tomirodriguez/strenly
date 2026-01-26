import { formatSeriesToNotation, parsePrescriptionToSeries } from '@strenly/contracts/programs/prescription'
import type {
  ExerciseGroupAggregate,
  ProgramAggregate,
  SeriesInput,
  SessionAggregate,
  WeekAggregate,
} from '@strenly/contracts/programs/program'
import type { ProgramDataInput } from '@strenly/contracts/programs/save-draft'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { recalculateSessionGroups } from '@/components/programs/program-grid/transform-program'
import type { GridColumn, GridData, GridRow } from '@/components/programs/program-grid/types'

/**
 * Grid state interface
 *
 * Maintains the program aggregate and grid display data.
 * The aggregate is the source of truth - grid data is derived from it.
 */
interface GridState {
  // Program aggregate (source of truth for save operations)
  aggregate: ProgramAggregate | null
  programId: string | null

  // Derived grid display data (computed from aggregate + exercises map)
  data: GridData | null

  // Dirty tracking
  isDirty: boolean
  lastLoadedAt: Date | null

  // Exercises map for display (exerciseId -> exerciseName)
  exercisesMap: Map<string, string>
}

/**
 * Grid actions interface
 */
interface GridActions {
  // Initialize store with program aggregate and exercises map
  initialize: (programId: string, aggregate: ProgramAggregate, exercisesMap: Map<string, string>) => void

  // Update grid display data (when aggregate or exercises map changes)
  setGridData: (data: GridData) => void

  // Update a prescription (series array) in both aggregate and grid
  updatePrescription: (itemId: string, weekId: string, notation: string) => void

  // Update an exercise selection in aggregate and grid
  updateExercise: (itemId: string, exerciseId: string, exerciseName: string) => void

  // Add a new exercise to a session (creates new group with single item)
  addExercise: (sessionId: string, exerciseId: string, exerciseName: string) => void

  // Add a new week to the program
  addWeek: () => void

  // Add a new session to the program
  addSession: (name: string) => void

  // Update a row's superset group (merges items into same group)
  updateSupersetGroup: (itemId: string, groupId: string | null) => void

  // Reset to server state (e.g., after refetch)
  reset: (aggregate: ProgramAggregate, exercisesMap: Map<string, string>) => void

  // Mark as saved (clear dirty flag)
  markSaved: () => void

  // Get the program aggregate for save operation
  getAggregateForSave: () => {
    program: ProgramDataInput
    lastLoadedAt: Date | null
  } | null
}

type GridStore = GridState & GridActions

/**
 * Transform aggregate to grid display data
 */
function aggregateToGridData(aggregate: ProgramAggregate, exercisesMap: Map<string, string>): GridData {
  // Build columns: exercise column + week columns sorted by orderIndex
  const sortedWeeks = [...aggregate.weeks].sort((a, b) => a.orderIndex - b.orderIndex)

  const columns: GridColumn[] = [
    { id: 'exercise', name: 'Ejercicio', type: 'exercise' },
    ...sortedWeeks.map((w) => ({
      id: w.id,
      name: w.name,
      type: 'week' as const,
      weekId: w.id,
    })),
  ]

  // Build rows from weeks - use first week as canonical structure
  const rows: GridRow[] = []
  const firstWeek = sortedWeeks[0]
  if (!firstWeek) {
    return { rows, columns }
  }

  // Sort sessions by orderIndex
  const sortedSessions = [...firstWeek.sessions].sort((a, b) => a.orderIndex - b.orderIndex)

  for (const session of sortedSessions) {
    // Add session header row
    rows.push({
      id: `session-header-${session.id}`,
      type: 'session-header',
      sessionId: session.id,
      sessionName: session.name,
      supersetGroup: null,
      supersetOrder: null,
      supersetPosition: null,
      isSubRow: false,
      parentRowId: null,
      setTypeLabel: null,
      prescriptions: {},
    })

    // Sort groups by orderIndex
    const sortedGroups = [...session.exerciseGroups].sort((a, b) => a.orderIndex - b.orderIndex)

    // Track group positions for visual indicators
    const LETTER_A_CODE = 65
    let letterIndex = 0

    for (const group of sortedGroups) {
      const sortedItems = [...group.items].sort((a, b) => a.orderIndex - b.orderIndex)
      const isSuperset = sortedItems.length > 1
      const groupLetter = String.fromCharCode(LETTER_A_CODE + letterIndex)
      letterIndex++

      sortedItems.forEach((item, itemIndex) => {
        // Build prescriptions map: weekId -> formatted notation
        const prescriptions: Record<string, string> = {}
        for (const week of sortedWeeks) {
          // Find the matching item in this week
          const weekSession = week.sessions.find((s) => s.id === session.id)
          const weekGroup = weekSession?.exerciseGroups.find((g) => g.id === group.id)
          const weekItem = weekGroup?.items.find((i) => i.id === item.id)
          if (weekItem?.series) {
            // Convert series to PrescriptionSeriesInput format for formatter
            const seriesInput = weekItem.series.map((s, idx) => ({
              orderIndex: idx,
              reps: s.reps,
              repsMax: s.repsMax,
              isAmrap: s.isAmrap,
              intensityType: s.intensityType,
              intensityValue: s.intensityValue,
              intensityUnit: null, // Aggregate doesn't store unit separately
              tempo: s.tempo,
            }))
            prescriptions[week.id] = formatSeriesToNotation(seriesInput)
          } else {
            prescriptions[week.id] = ''
          }
        }

        // Determine superset position for visual line connector
        let supersetPosition: 'start' | 'middle' | 'end' | null = null
        if (isSuperset) {
          if (itemIndex === 0) supersetPosition = 'start'
          else if (itemIndex === sortedItems.length - 1) supersetPosition = 'end'
          else supersetPosition = 'middle'
        }

        const exerciseName = exercisesMap.get(item.exerciseId) ?? 'Unknown Exercise'

        rows.push({
          id: item.id,
          type: 'exercise',
          sessionId: session.id,
          sessionName: session.name,
          exercise: {
            exerciseId: item.exerciseId,
            exerciseName,
            position: item.orderIndex,
          },
          supersetGroup: isSuperset ? group.id : null,
          supersetOrder: isSuperset ? itemIndex + 1 : null,
          supersetPosition,
          groupLetter,
          groupIndex: itemIndex + 1,
          isSubRow: false,
          parentRowId: null,
          setTypeLabel: null,
          prescriptions,
        })
      })
    }

    // Add "add exercise" row for this session
    rows.push({
      id: `add-exercise-${session.id}`,
      type: 'add-exercise',
      sessionId: session.id,
      sessionName: session.name,
      supersetGroup: null,
      supersetOrder: null,
      supersetPosition: null,
      isSubRow: false,
      parentRowId: null,
      setTypeLabel: null,
      prescriptions: {},
    })
  }

  return { rows, columns }
}

/**
 * Deep clone an object (simple JSON approach for aggregate data)
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Generate a unique ID for new entities
 */
function generateId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Zustand store for program grid state
 *
 * Maintains the program aggregate as source of truth.
 * Grid data is derived from the aggregate + exercises map.
 * All mutations update the aggregate directly.
 */
export const useGridStore = create<GridStore>((set, get) => ({
  // Initial state
  aggregate: null,
  programId: null,
  data: null,
  isDirty: false,
  lastLoadedAt: null,
  exercisesMap: new Map(),

  // Initialize store with program aggregate
  initialize: (programId, aggregate, exercisesMap) => {
    const gridData = aggregateToGridData(aggregate, exercisesMap)
    set({
      programId,
      aggregate: deepClone(aggregate),
      data: gridData,
      exercisesMap,
      isDirty: false,
      lastLoadedAt: new Date(),
    })
  },

  setGridData: (data) => set({ data }),

  // Update prescription in aggregate and grid
  updatePrescription: (itemId, weekId, notation) =>
    set((state) => {
      if (!state.aggregate || !state.data) return state

      // Parse notation to series
      const parsedSeries = parsePrescriptionToSeries(notation)
      if (parsedSeries === null) {
        // Invalid notation, don't update
        return state
      }

      // Convert to SeriesInput format for aggregate
      const seriesInput: SeriesInput[] = parsedSeries.map((s) => ({
        reps: s.reps,
        repsMax: s.repsMax ?? undefined,
        isAmrap: s.isAmrap,
        intensityType: s.intensityType ?? undefined,
        intensityValue: s.intensityValue ?? undefined,
        tempo: s.tempo ?? undefined,
        restSeconds: undefined,
      }))

      // Deep clone aggregate for immutable update
      const newAggregate = deepClone(state.aggregate)

      // Find and update the item in the specified week
      const week = newAggregate.weeks.find((w) => w.id === weekId)
      if (week) {
        for (const session of week.sessions) {
          for (const group of session.exerciseGroups) {
            const item = group.items.find((i) => i.id === itemId)
            if (item) {
              item.series = seriesInput.map((s, idx) => ({
                orderIndex: idx,
                reps: s.reps ?? null,
                repsMax: s.repsMax ?? null,
                isAmrap: s.isAmrap,
                intensityType: s.intensityType ?? null,
                intensityValue: s.intensityValue ?? null,
                tempo: s.tempo ?? null,
                restSeconds: s.restSeconds ?? null,
              }))
              break
            }
          }
        }
      }

      // Update grid display data
      const notationDisplay = formatSeriesToNotation(parsedSeries)
      const updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise' && row.id === itemId) {
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

      return {
        aggregate: newAggregate,
        data: { ...state.data, rows: updatedRows },
        isDirty: true,
      }
    }),

  // Update exercise selection
  updateExercise: (itemId, exerciseId, exerciseName) =>
    set((state) => {
      if (!state.aggregate || !state.data) return state

      // Deep clone aggregate for immutable update
      const newAggregate = deepClone(state.aggregate)

      // Update exercise ID in all weeks (item ID is consistent across weeks)
      for (const week of newAggregate.weeks) {
        for (const session of week.sessions) {
          for (const group of session.exerciseGroups) {
            const item = group.items.find((i) => i.id === itemId)
            if (item) {
              item.exerciseId = exerciseId
            }
          }
        }
      }

      // Update grid display
      const updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise' && row.id === itemId && row.exercise) {
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

      // Update exercises map
      const newExercisesMap = new Map(state.exercisesMap)
      newExercisesMap.set(exerciseId, exerciseName)

      return {
        aggregate: newAggregate,
        data: { ...state.data, rows: updatedRows },
        exercisesMap: newExercisesMap,
        isDirty: true,
      }
    }),

  // Add exercise (creates new group with single item)
  addExercise: (sessionId, exerciseId, exerciseName) =>
    set((state) => {
      if (!state.aggregate || !state.data) return state

      const newAggregate = deepClone(state.aggregate)
      const itemId = generateId()
      const groupId = generateId()

      // Add to all weeks
      for (const week of newAggregate.weeks) {
        const session = week.sessions.find((s) => s.id === sessionId)
        if (session) {
          // Calculate order index
          const maxGroupOrder = Math.max(-1, ...session.exerciseGroups.map((g) => g.orderIndex))

          // Create new group with single item
          const newGroup: ExerciseGroupAggregate = {
            id: groupId,
            orderIndex: maxGroupOrder + 1,
            items: [
              {
                id: itemId,
                exerciseId,
                orderIndex: 0,
                series: [],
              },
            ],
          }
          session.exerciseGroups.push(newGroup)
        }
      }

      // Update exercises map
      const newExercisesMap = new Map(state.exercisesMap)
      newExercisesMap.set(exerciseId, exerciseName)

      // Regenerate grid data
      const gridData = aggregateToGridData(newAggregate, newExercisesMap)

      return {
        aggregate: newAggregate,
        data: gridData,
        exercisesMap: newExercisesMap,
        isDirty: true,
      }
    }),

  // Add week
  addWeek: () =>
    set((state) => {
      if (!state.aggregate || !state.data) return state

      const newAggregate = deepClone(state.aggregate)
      const weekId = generateId()
      const orderIndex = newAggregate.weeks.length

      // Clone structure from first week if exists
      const firstWeek = newAggregate.weeks[0]
      const sessions: SessionAggregate[] = firstWeek
        ? firstWeek.sessions.map((s) => ({
            id: s.id,
            name: s.name,
            orderIndex: s.orderIndex,
            exerciseGroups: s.exerciseGroups.map((g) => ({
              id: g.id,
              orderIndex: g.orderIndex,
              items: g.items.map((i) => ({
                id: i.id,
                exerciseId: i.exerciseId,
                orderIndex: i.orderIndex,
                series: [], // Empty series for new week
              })),
            })),
          }))
        : []

      const newWeek: WeekAggregate = {
        id: weekId,
        name: `Semana ${orderIndex + 1}`,
        orderIndex,
        sessions,
      }

      newAggregate.weeks.push(newWeek)

      // Regenerate grid data
      const gridData = aggregateToGridData(newAggregate, state.exercisesMap)

      return {
        aggregate: newAggregate,
        data: gridData,
        isDirty: true,
      }
    }),

  // Add session
  addSession: (name: string) =>
    set((state) => {
      if (!state.aggregate || !state.data) return state

      const newAggregate = deepClone(state.aggregate)
      const sessionId = generateId()

      // Calculate order index from first week
      const firstWeek = newAggregate.weeks[0]
      const orderIndex = firstWeek ? firstWeek.sessions.length : 0

      // Add to all weeks
      for (const week of newAggregate.weeks) {
        const newSession: SessionAggregate = {
          id: sessionId,
          name,
          orderIndex,
          exerciseGroups: [],
        }
        week.sessions.push(newSession)
      }

      // Regenerate grid data
      const gridData = aggregateToGridData(newAggregate, state.exercisesMap)

      return {
        aggregate: newAggregate,
        data: gridData,
        isDirty: true,
      }
    }),

  // Update superset group (merge items into same group or separate)
  updateSupersetGroup: (itemId, targetGroupId) =>
    set((state) => {
      if (!state.aggregate || !state.data) return state

      // For now, just update grid display for visual feedback
      // Full superset management is a more complex feature for later

      const targetRow = state.data.rows.find((row) => row.type === 'exercise' && row.id === itemId)
      if (!targetRow) return state
      const sessionId = targetRow.sessionId

      let updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise' && row.id === itemId) {
          return {
            ...row,
            supersetGroup: targetGroupId,
          }
        }
        return row
      })

      // Recalculate group labels for the session
      const sessionExerciseRows = updatedRows.filter((row) => row.type === 'exercise' && row.sessionId === sessionId)
      const recalculatedRows = recalculateSessionGroups(sessionExerciseRows)
      const recalculatedMap = new Map(recalculatedRows.map((row) => [row.id, row]))

      updatedRows = updatedRows.map((row) => {
        const recalculated = recalculatedMap.get(row.id)
        return recalculated ?? row
      })

      return {
        data: { ...state.data, rows: updatedRows },
        isDirty: true,
      }
    }),

  // Reset to server state
  reset: (aggregate, exercisesMap) => {
    const gridData = aggregateToGridData(aggregate, exercisesMap)
    set({
      aggregate: deepClone(aggregate),
      data: gridData,
      exercisesMap,
      isDirty: false,
      lastLoadedAt: new Date(),
    })
  },

  // Mark as saved
  markSaved: () => set({ isDirty: false }),

  // Get aggregate for save
  getAggregateForSave: () => {
    const state = get()
    if (!state.aggregate) return null

    // Convert aggregate to ProgramDataInput format
    const program: ProgramDataInput = {
      name: state.aggregate.name,
      description: state.aggregate.description,
      athleteId: state.aggregate.athleteId,
      isTemplate: state.aggregate.isTemplate,
      status: state.aggregate.status,
      weeks: state.aggregate.weeks.map((week) => ({
        id: week.id,
        name: week.name,
        orderIndex: week.orderIndex,
        sessions: week.sessions.map((session) => ({
          id: session.id,
          name: session.name,
          orderIndex: session.orderIndex,
          exerciseGroups: session.exerciseGroups.map((group) => ({
            id: group.id,
            orderIndex: group.orderIndex,
            items: group.items.map((item) => ({
              id: item.id,
              exerciseId: item.exerciseId,
              orderIndex: item.orderIndex,
              series: item.series?.map((s) => ({
                reps: s.reps,
                repsMax: s.repsMax ?? undefined,
                isAmrap: s.isAmrap,
                intensityType: s.intensityType ?? undefined,
                intensityValue: s.intensityValue ?? undefined,
                tempo: s.tempo ?? undefined,
                restSeconds: s.restSeconds ?? undefined,
              })),
            })),
          })),
        })),
      })),
    }

    return {
      program,
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
      getAggregateForSave: state.getAggregateForSave,
    })),
  )
