import { SupersetIndicator } from './superset-indicator'
import type { GridRow } from './types'
import { cn } from '@/lib/utils'

interface ExerciseRowPrefixProps {
  row: GridRow
}

/**
 * Row prefix showing logical group label (A1, B1, B2, C1).
 *
 * All exercises are treated as groups:
 * - Standalone exercise = group of 1 (A1, B1)
 * - Superset = group of N (C1, C2, C3)
 *
 * Visual rules from UI/UX spec:
 * - Superset rows (multiple items in group): primary color text
 * - Non-superset rows (single-item group): muted text
 * - Width: w-10 (40px)
 * - Font: 10px, bold
 */
export function ExerciseRowPrefix({ row }: ExerciseRowPrefixProps) {
  // Empty rows (no exercise assigned) show an empty prefix slot
  if (!row.exercise) {
    return (
      <div className="relative flex h-full items-center">
        <span className="z-30 flex h-full w-10 items-center justify-center border-border border-r bg-muted/20" />
      </div>
    )
  }

  // Unified format: always letter + number
  // Standalone exercises are groups of 1 (A1, B1)
  // Supersets are groups of N (C1, C2, C3)
  const letter = row.groupLetter ?? 'A'
  const index = row.groupIndex ?? 1
  const label = `${letter}${index}`

  return (
    <div className="relative flex h-full items-center">
      {/* Superset line indicator */}
      <SupersetIndicator position={row.supersetPosition} />

      {/* Prefix label */}
      <span
        className={cn(
          'z-30 flex h-full w-10 items-center justify-center border-border border-r font-bold text-[10px]',
          row.supersetGroup ? 'bg-background text-primary' : 'bg-muted/20 text-muted-foreground',
        )}
      >
        {label}
      </span>
    </div>
  )
}
