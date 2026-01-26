import {
  formatPrescription,
  type ParsedPrescription,
  parsePrescriptionNotation,
} from '@strenly/contracts/programs/prescription'
import type { CellComponent, Column } from '@wasback/react-datasheet-grid'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Prescription cell component for react-datasheet-grid
 * Handles prescription notation parsing and formatting:
 * - Shows formatted prescription (e.g., "3x8@120kg") when not focused
 * - Shows raw notation for editing when focused
 * - Parses notation on blur via parsePrescriptionNotation
 * - Handles Enter/Tab/Escape for navigation
 */
const PrescriptionCell: CellComponent<ParsedPrescription | null, { weekId: string }> = ({
  rowData,
  setRowData,
  focus,
  stopEditing,
  active,
}) => {
  const [inputValue, setInputValue] = useState(rowData ? formatPrescription(rowData) : '')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when cell becomes active
  useEffect(() => {
    if (focus) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [focus])

  // Sync input value with row data when it changes externally
  useEffect(() => {
    if (!focus) {
      setInputValue(rowData ? formatPrescription(rowData) : '')
    }
  }, [rowData, focus])

  const handleBlur = () => {
    const parsed = parsePrescriptionNotation(inputValue)
    setRowData(parsed)
    stopEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      // Don't prevent default - let react-datasheet-grid handle navigation
      handleBlur()
    }
    if (e.key === 'Escape') {
      // Reset to original value
      setInputValue(rowData ? formatPrescription(rowData) : '')
      stopEditing()
    }
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
 * Create a prescription column for react-datasheet-grid
 * @param weekId - The week ID this column represents
 * @returns Column configuration for prescriptions
 */
export function prescriptionColumn(weekId: string): Column<ParsedPrescription | null, { weekId: string }> {
  return {
    component: PrescriptionCell,
    columnData: { weekId },
    deleteValue: () => null,
    copyValue: ({ rowData }) => (rowData ? formatPrescription(rowData) : ''),
    pasteValue: ({ value }) => parsePrescriptionNotation(value),
    minWidth: 120,
    title: 'Prescription',
    isCellEmpty: ({ rowData }) => rowData === null,
  }
}

/**
 * Format prescription for display (shorthand helper)
 */
export { formatPrescription, parsePrescriptionNotation }
