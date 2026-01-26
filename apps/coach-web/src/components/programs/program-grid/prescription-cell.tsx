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
 * - Double-click, Enter, or F2 enters edit mode
 * - Typing digits (0-9) starts editing with that digit (Excel convention)
 * - Letter keys and other characters do NOT trigger edit mode
 * - Enter commits, Escape cancels
 * - Tab/Shift+Tab commit and navigate horizontally
 * - Arrow keys move cursor within input; navigate only at text boundaries
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
    if (isEditing && inputRef.current) {
      const input = inputRef.current
      input.focus()
      // Position cursor at end instead of selecting all text
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        const len = input.value.length
        input.setSelectionRange(len, len)
      })
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
      case 'ArrowDown':
        // Always navigate for vertical - no cursor movement in single-line input
        e.preventDefault()
        onCommit(editValue)
        onNavigate(e.key === 'ArrowUp' ? 'up' : 'down')
        break
      case 'ArrowLeft':
        // Only navigate if cursor is at the very start (no selection)
        if (inputRef.current?.selectionStart === 0 && inputRef.current?.selectionEnd === 0) {
          e.preventDefault()
          onCommit(editValue)
          onNavigate('left')
        }
        // Otherwise, let browser handle cursor movement (don't preventDefault)
        break
      case 'ArrowRight':
        // Only navigate if cursor is at the very end
        if (inputRef.current?.selectionStart === editValue.length) {
          e.preventDefault()
          onCommit(editValue)
          onNavigate('right')
        }
        // Otherwise, let browser handle cursor movement
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
        // Only start editing on numeric keys (0-9) - NOT letters
        if (/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault()
          setEditValue(e.key) // Start with typed digit
          onStartEdit()
        }
      // All other keys (letters, symbols, arrows) bubble to grid for navigation
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

  // Render prescription display with multi-line support for varied series
  const renderPrescriptionDisplay = (displayValue: string) => {
    // If value contains " + " it's multi-part with variations
    if (displayValue.includes(' + ')) {
      const parts = displayValue.split(' + ')
      return (
        <div className="flex flex-col justify-center py-0.5">
          {parts.map((part, index) => (
            <span key={`${index}-${part}`} className="text-xs leading-tight">
              {part}
            </span>
          ))}
        </div>
      )
    }

    // Single part - normal display
    return <span>{displayValue}</span>
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
          'flex min-h-10 items-center justify-center px-2 py-1 text-[13px]',
          isSubRow ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {value ? renderPrescriptionDisplay(value) : '\u2014'} {/* Em dash for empty cells */}
      </div>
    </td>
  )
}
