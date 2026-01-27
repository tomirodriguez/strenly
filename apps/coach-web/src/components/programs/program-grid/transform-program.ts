import { formatSeriesToNotation, mapIntensityTypeToUnit } from '@strenly/contracts/programs/prescription'
import type { ProgramAggregate } from '@strenly/contracts/programs/program'
import type { GridColumn, GridData, GridRow, SupersetPosition } from './types'

/**
 * Recalculate groupLetter and groupIndex for all exercise rows in a session.
 *
 * Rules:
 * - Letter (A, B, C...) assigned sequentially as groups are encountered
 * - Index (1, 2, 3...) is position within that group
 * - Rows without supersetGroup get their own letter with index 1
 * - Rows sharing supersetGroup share a letter, indices increment
 *
 * @param sessionRows - Exercise rows belonging to a single session (ordered)
 * @returns Updated rows with groupLetter and groupIndex set
 */
export function recalculateSessionGroups(sessionRows: GridRow[]): GridRow[] {
  const LETTER_A_CODE = 65
  let letterIndex = 0
  const groupLetters = new Map<string, string>()
  const groupCounters = new Map<string, number>()

  return sessionRows.map((row) => {
    if (row.type !== 'exercise') return row

    if (row.supersetGroup) {
      // Named group (superset) - share letter, increment counter
      let letter = groupLetters.get(row.supersetGroup)
      if (!letter) {
        letter = String.fromCharCode(LETTER_A_CODE + letterIndex)
        groupLetters.set(row.supersetGroup, letter)
        groupCounters.set(row.supersetGroup, 0)
        letterIndex++
      }
      const counter = (groupCounters.get(row.supersetGroup) ?? 0) + 1
      groupCounters.set(row.supersetGroup, counter)

      return { ...row, groupLetter: letter, groupIndex: counter }
    }
    // Standalone exercise = implicit group of 1
    const letter = String.fromCharCode(LETTER_A_CODE + letterIndex)
    letterIndex++
    return { ...row, groupLetter: letter, groupIndex: 1 }
  })
}

/**
 * Transform Program aggregate to GridData for display.
 *
 * Uses the new aggregate pattern where the program hierarchy is:
 * Program > Weeks > Sessions > ExerciseGroups > Items > Series
 *
 * @param program - The program aggregate from the API
 * @param exercisesMap - Map of exerciseId -> exerciseName for display
 */
export function transformProgramToGrid(program: ProgramAggregate, exercisesMap: Map<string, string>): GridData {
  // Build columns: exercise column + week columns sorted by orderIndex
  const sortedWeeks = [...program.weeks].sort((a, b) => a.orderIndex - b.orderIndex)

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
          if (weekItem?.series && weekItem.series.length > 0) {
            // Convert series to PrescriptionSeriesInput format for formatter
            const seriesInput = weekItem.series.map((s, idx) => ({
              orderIndex: idx,
              reps: s.reps,
              repsMax: s.repsMax,
              isAmrap: s.isAmrap,
              intensityType: s.intensityType,
              intensityValue: s.intensityValue,
              intensityUnit: mapIntensityTypeToUnit(s.intensityType), // Derive from type
              tempo: s.tempo,
            }))
            prescriptions[week.id] = formatSeriesToNotation(seriesInput)
          } else {
            prescriptions[week.id] = ''
          }
        }

        // Determine superset position for visual line connector
        let supersetPosition: SupersetPosition = null
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
