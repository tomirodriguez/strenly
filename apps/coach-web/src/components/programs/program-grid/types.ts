// Cell position identifier
export interface GridCell {
  rowIndex: number
  colIndex: number
  rowId: string // exercise row ID
  colId: string // week ID or 'exercise' for first column
}

// Column definition (weeks + exercise column)
export interface GridColumn {
  id: string
  name: string
  type: 'exercise' | 'week'
  weekId?: string
}

// Row types
export type GridRowType = 'session-header' | 'exercise' | 'add-exercise'

// Superset line position for visual indicator
export type SupersetPosition = 'start' | 'middle' | 'end' | null

// Row data structure
export interface GridRow {
  id: string
  type: GridRowType
  sessionId: string
  sessionName: string

  // Exercise-specific fields (only for type: 'exercise')
  exercise?: {
    exerciseId: string
    exerciseName: string
    position: number
  }

  // Superset fields
  supersetGroup: string | null
  supersetOrder: number | null
  supersetPosition: SupersetPosition

  // Split row fields
  isSubRow: boolean
  parentRowId: string | null
  setTypeLabel: string | null

  // Prescriptions indexed by weekId
  prescriptions: Record<string, string>
}

// Full grid data structure
export interface GridData {
  rows: GridRow[]
  columns: GridColumn[]
}
