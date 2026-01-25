import type { SupersetPosition } from './types'
import { cn } from '@/lib/utils'

interface SupersetIndicatorProps {
  position: SupersetPosition
}

/**
 * Vertical blue line indicator for superset grouping.
 * Position determines how the line extends:
 * - start: line from middle of row downward
 * - middle: line extends both up and down
 * - end: line from above to middle of row
 */
export function SupersetIndicator({ position }: SupersetIndicatorProps) {
  if (!position) return null

  return (
    <div
      className={cn(
        'absolute left-[15px] w-[1.5px] bg-primary/40 z-20',
        position === 'start' && 'top-1/2 bottom-[-50%]',
        position === 'middle' && 'top-[-50%] bottom-[-50%]',
        position === 'end' && 'top-[-50%] bottom-1/2'
      )}
    />
  )
}
