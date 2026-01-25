import type { GridRow } from './types'
import { SupersetIndicator } from './superset-indicator'
import { cn } from '@/lib/utils'

interface ExerciseRowPrefixProps {
  row: GridRow
}

// Letters for labeling non-superset rows based on position
const POSITION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

/**
 * Row prefix showing superset group (A1, B2) or position number.
 *
 * Visual rules from UI/UX spec:
 * - Superset rows: primary color text, background-dark bg
 * - Non-superset rows: muted text, slightly darker bg
 * - Width: w-10 (40px)
 * - Font: 10px, bold
 */
export function ExerciseRowPrefix({ row }: ExerciseRowPrefixProps) {
  // Generate display label: A1, B2, C1 for supersets, or just letter + position for non-superset
  const getLabel = (): string => {
    if (row.supersetGroup) {
      return `${row.supersetGroup}${row.supersetOrder ?? ''}`
    }

    // For non-superset rows, show letter based on exercise position
    const position = row.exercise?.position ?? 0
    const letter = POSITION_LETTERS[position] ?? 'A'
    return `${letter}1`
  }

  const label = getLabel()

  return (
    <div className="relative flex h-full items-center">
      {/* Superset line indicator */}
      <SupersetIndicator position={row.supersetPosition} />

      {/* Prefix label */}
      <span
        className={cn(
          'z-30 flex h-full w-10 items-center justify-center border-r border-border text-[10px] font-bold',
          row.supersetGroup ? 'bg-background text-primary' : 'bg-muted/20 text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  )
}
