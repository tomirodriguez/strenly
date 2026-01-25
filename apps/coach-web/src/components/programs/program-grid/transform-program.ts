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
 * Transform API program data to grid-compatible format
 *
 * Builds:
 * - columns: exercise column + week columns sorted by orderIndex
 * - rows: session headers + exercise rows + add-exercise rows per session
 *
 * Handles:
 * - Superset position calculation for visual indicators
 * - Sub-row flattening (split rows become separate GridRows)
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

    // Build flat list of rows (parent + sub-rows)
    interface FlatRow {
      id: string
      exerciseId: string
      exerciseName: string
      position: number
      supersetGroup: string | null
      supersetOrder: number | null
      isSubRow: boolean
      parentRowId: string | null
      setTypeLabel: string | null
      prescriptionsByWeekId: Record<string, Prescription>
    }

    const flatRows: FlatRow[] = []
    for (const row of sessionRows) {
      // Add main row
      flatRows.push({
        id: row.id,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        position: row.orderIndex,
        supersetGroup: row.supersetGroup,
        supersetOrder: row.supersetOrder,
        isSubRow: row.isSubRow,
        parentRowId: row.parentRowId,
        setTypeLabel: row.setTypeLabel,
        prescriptionsByWeekId: row.prescriptionsByWeekId,
      })

      // Add sub-rows if any
      if (row.subRows && row.subRows.length > 0) {
        for (const subRow of row.subRows) {
          flatRows.push({
            id: subRow.id,
            exerciseId: subRow.exerciseId,
            exerciseName: subRow.exerciseName,
            position: subRow.orderIndex,
            supersetGroup: subRow.supersetGroup,
            supersetOrder: subRow.supersetOrder,
            isSubRow: true,
            parentRowId: row.id,
            setTypeLabel: subRow.setTypeLabel,
            prescriptionsByWeekId: subRow.prescriptionsByWeekId,
          })
        }
      }
    }

    // Calculate superset positions for visual indicators
    // Group exercises by supersetGroup
    const supersetGroups = new Map<string, number[]>()
    flatRows.forEach((row, idx) => {
      if (row.supersetGroup) {
        const group = supersetGroups.get(row.supersetGroup) ?? []
        group.push(idx)
        supersetGroups.set(row.supersetGroup, group)
      }
    })

    // Calculate dynamic supersetOrder based on physical position within each group
    // This replaces stored supersetOrder values which become stale after reordering
    const dynamicSupersetOrder = new Map<number, number>() // flatRowIndex -> order (1-based)
    for (const [, indices] of supersetGroups) {
      // indices are already in physical order (since we iterated flatRows in order)
      indices.forEach((idx, orderInGroup) => {
        dynamicSupersetOrder.set(idx, orderInGroup + 1) // 1-based: A1, A2, A3
      })
    }

    // Add exercise rows with superset position
    flatRows.forEach((row, idx) => {
      // Calculate superset position
      let supersetPosition: SupersetPosition = null
      if (row.supersetGroup) {
        const groupIndices = supersetGroups.get(row.supersetGroup) ?? []
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

      // Use dynamic supersetOrder instead of stored value
      const calculatedSupersetOrder = row.supersetGroup ? dynamicSupersetOrder.get(idx) ?? null : null

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
        supersetGroup: row.supersetGroup,
        supersetOrder: calculatedSupersetOrder,
        supersetPosition,
        isSubRow: row.isSubRow,
        parentRowId: row.parentRowId,
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
