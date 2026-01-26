import type { Prescription, ProgramWithDetails } from '@strenly/contracts/programs/program'
import type { GridColumn, GridData, GridRow, SupersetPosition } from './types'

/**
 * Format a prescription object to notation string for grid display
 */
function formatPrescriptionToNotation(prescription: Prescription): string {
  const { sets, repsMin, repsMax, isAmrap, isUnilateral, unilateralUnit, intensityType, intensityValue, tempo } =
    prescription

  // AMRAP format
  if (isAmrap) {
    return tempo ? `${sets}xAMRAP (${tempo})` : `${sets}xAMRAP`
  }

  // Build result string
  let result = `${sets}x${repsMin}`

  // Add rep range if different from min
  if (repsMax !== null && repsMax !== repsMin) {
    result += `-${repsMax}`
  }

  // Add unilateral unit
  if (isUnilateral && unilateralUnit) {
    result += `/${unilateralUnit}`
  }

  // Add intensity
  if (intensityType && intensityValue !== null) {
    switch (intensityType) {
      case 'absolute':
        result += `@${intensityValue}kg`
        break
      case 'percentage':
        result += `@${intensityValue}%`
        break
      case 'rir':
        result += `@RIR${intensityValue}`
        break
      case 'rpe':
        result += `@RPE${intensityValue}`
        break
    }
  }

  // Add tempo
  if (tempo) {
    result += ` (${tempo})`
  }

  return result
}

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
 * Transform API program data to grid-compatible format
 *
 * Builds:
 * - columns: exercise column + week columns sorted by orderIndex
 * - rows: session headers + exercise rows + add-exercise rows per session
 *
 * Handles:
 * - Group position calculation for visual indicators (supersets use exercise groups)
 * - Prescription formatting for display
 */
export function transformProgramToGrid(program: ProgramWithDetails): GridData {
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

  // Build rows: session headers + exercise rows + add-exercise rows per session
  const rows: GridRow[] = []

  // Sort sessions by orderIndex
  const sortedSessions = [...program.sessions].sort((a, b) => a.orderIndex - b.orderIndex)

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

    // Get exercise rows for this session sorted by orderIndex
    const sessionRows = [...session.rows].sort((a, b) => a.orderIndex - b.orderIndex)

    // Build flat list of rows with group information
    interface FlatRow {
      id: string
      exerciseId: string
      exerciseName: string
      position: number
      groupId: string | null
      orderWithinGroup: number | null
      setTypeLabel: string | null
      prescriptionsByWeekId: Record<string, Prescription>
      // Logical group for unified display (calculated below)
      groupLetter?: string
      groupIndex?: number
    }

    const flatRows: FlatRow[] = []
    for (const row of sessionRows) {
      // Add row
      flatRows.push({
        id: row.id,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        position: row.orderIndex,
        groupId: row.groupId,
        orderWithinGroup: row.orderWithinGroup,
        setTypeLabel: row.setTypeLabel,
        prescriptionsByWeekId: row.prescriptionsByWeekId,
      })
    }

    // Calculate group positions for visual indicators
    // Group exercises by groupId
    const exerciseGroups = new Map<string, number[]>()
    flatRows.forEach((row, idx) => {
      if (row.groupId) {
        const group = exerciseGroups.get(row.groupId) ?? []
        group.push(idx)
        exerciseGroups.set(row.groupId, group)
      }
    })

    // Calculate dynamic order based on physical position within each group
    const dynamicGroupOrder = new Map<number, number>() // flatRowIndex -> order (1-based)
    for (const [, indices] of exerciseGroups) {
      // indices are already in physical order (since we iterated flatRows in order)
      indices.forEach((idx, orderInGroup) => {
        dynamicGroupOrder.set(idx, orderInGroup + 1) // 1-based: A1, A2, A3
      })
    }

    // Calculate logical groups - treating ALL exercises as groups
    // Standalone = group of 1, Grouped = group of N
    const LETTER_A_CODE = 65
    let letterIndex = 0
    const groupLetters = new Map<string, string>()
    const groupCounters = new Map<string, number>()

    for (const row of flatRows) {
      if (row.groupId) {
        // Named group (superset) - share letter, increment counter
        let letter = groupLetters.get(row.groupId)
        if (!letter) {
          letter = String.fromCharCode(LETTER_A_CODE + letterIndex)
          groupLetters.set(row.groupId, letter)
          groupCounters.set(row.groupId, 0)
          letterIndex++
        }
        const counter = (groupCounters.get(row.groupId) ?? 0) + 1
        groupCounters.set(row.groupId, counter)

        row.groupLetter = letter
        row.groupIndex = counter
      } else {
        // Standalone exercise = implicit group of 1
        row.groupLetter = String.fromCharCode(LETTER_A_CODE + letterIndex)
        row.groupIndex = 1
        letterIndex++
      }
    }

    // Add exercise rows with group position
    flatRows.forEach((row, idx) => {
      // Calculate superset position (for visual line connector)
      let supersetPosition: SupersetPosition = null
      if (row.groupId) {
        const groupIndices = exerciseGroups.get(row.groupId) ?? []
        const posInGroup = groupIndices.indexOf(idx)
        if (groupIndices.length === 1) {
          supersetPosition = null // Single item, no line
        } else if (posInGroup === 0) {
          supersetPosition = 'start'
        } else if (posInGroup === groupIndices.length - 1) {
          supersetPosition = 'end'
        } else {
          supersetPosition = 'middle'
        }
      }

      // Use dynamic order instead of stored value
      const calculatedOrder = row.groupId ? (dynamicGroupOrder.get(idx) ?? null) : null

      // Build prescriptions map: weekId -> formatted notation
      const prescriptions: Record<string, string> = {}
      for (const [weekId, prescription] of Object.entries(row.prescriptionsByWeekId)) {
        prescriptions[weekId] = formatPrescriptionToNotation(prescription)
      }

      rows.push({
        id: row.id,
        type: 'exercise',
        sessionId: session.id,
        sessionName: session.name,
        exercise: {
          exerciseId: row.exerciseId,
          exerciseName: row.exerciseName,
          position: row.position,
        },
        // Map groupId to supersetGroup for backward compatibility with UI
        supersetGroup: row.groupId,
        supersetOrder: calculatedOrder,
        supersetPosition,
        groupLetter: row.groupLetter,
        groupIndex: row.groupIndex,
        isSubRow: false,
        parentRowId: null,
        setTypeLabel: row.setTypeLabel,
        prescriptions,
      })
    })

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
