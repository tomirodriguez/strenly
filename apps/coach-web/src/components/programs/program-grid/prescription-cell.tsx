import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PrescriptionCellProps {
  value: string
  rowId: string
  weekId: string
  isActive: boolean
  isEditing: boolean
  isSubRow: boolean
  onSelect: () => void
  onStartEdit: () => void
  onCommit: (value: string) => void
  onCancel: () => void
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => void
}

/**
 * Prescription cell component for week columns in the program grid.
 *
 * Features:
 * - Single click selects cell
 * - Double-click or Enter/F2 enters edit mode
 * - Type any key to start editing with that character
 * - Enter commits, Escape cancels
 * - Tab/Shift+Tab commit and navigate horizontally
 * - Arrow keys commit and navigate (or bubble to grid when not editing)
 * - Em dash for empty values
 * - Sub-row values dimmed
 */
export function PrescriptionCell({
  value,
  rowId,
  weekId,
  isActive,
  isEditing,
  isSubRow,
  onSelect,
  onStartEdit,
  onCommit,
  onCancel,
  onNavigate,
}: PrescriptionCellProps) {
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Reset edit value when cell value changes externally
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value)
    }
  }, [value, isEditing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        onCommit(editValue)
        break
      case 'Escape':
        e.preventDefault()
        setEditValue(value)
        onCancel()
        break
      case 'Tab':
        e.preventDefault()
        onCommit(editValue)
        onNavigate(e.shiftKey ? 'shift-tab' : 'tab')
        break
      case 'ArrowUp':
        if (!e.shiftKey) {
          e.preventDefault()
          onCommit(editValue)
          onNavigate('up')
        }
        break
      case 'ArrowDown':
        if (!e.shiftKey) {
          e.preventDefault()
          onCommit(editValue)
          onNavigate('down')
        }
        break
      case 'ArrowLeft':
        // Only navigate if cursor is at start
        if (inputRef.current?.selectionStart === 0 && inputRef.current?.selectionEnd === 0) {
          e.preventDefault()
          onCommit(editValue)
          onNavigate('left')
        }
        break
      case 'ArrowRight':
        // Only navigate if cursor is at end
        if (inputRef.current?.selectionStart === editValue.length) {
          e.preventDefault()
          onCommit(editValue)
          onNavigate('right')
        }
        break
    }
  }

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    // Only handle edit mode triggers - let navigation keys bubble to grid
    switch (e.key) {
      case 'Enter':
      case 'F2':
        // Start editing on Enter or F2 (Excel convention)
        e.preventDefault()
        onStartEdit()
        break
      default:
        // Start editing on any printable character
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault()
          setEditValue(e.key) // Start with typed character
          onStartEdit()
        }
        // Let arrow keys, Tab, etc. bubble to the grid for navigation
    }
  }

  // Edit mode
  if (isEditing) {
    return (
      <td className="group border-border border-r border-b p-0" data-row-id={rowId} data-week-id={weekId}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onCommit(editValue)}
          onKeyDown={handleKeyDown}
          className="h-10 w-full border-none bg-transparent text-center text-[13px] placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-inset"
          placeholder="3x8@RIR2"
        />
      </td>
    )
  }

  // View mode
  return (
    <td
      className={cn(
        'cursor-text border-border border-r border-b p-0',
        isActive && 'bg-primary/5 ring-1 ring-primary ring-inset',
      )}
      onClick={onSelect}
      onDoubleClick={onStartEdit}
      onKeyDown={handleCellKeyDown}
      tabIndex={isActive ? 0 : -1}
      data-row-id={rowId}
      data-week-id={weekId}
    >
      <div
        className={cn(
          'flex h-10 items-center justify-center px-2 text-[13px]',
          isSubRow ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {value || '\u2014'} {/* Em dash for empty cells */}
      </div>
    </td>
  )
}
