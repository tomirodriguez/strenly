import type { MuscleGroup } from '@strenly/contracts/exercises/muscle-group'
import { Badge } from '@/components/ui/badge'

type MuscleBadgesProps = {
  muscles: MuscleGroup[]
  variant: 'primary' | 'secondary'
}

/**
 * Display muscle groups as badges with truncation
 * Primary muscles use default badge variant, secondary use outline variant
 */
export function MuscleBadges({ muscles, variant }: MuscleBadgesProps) {
  if (muscles.length === 0) return null

  const maxVisible = 3
  const visibleMuscles = muscles.slice(0, maxVisible)
  const remainingCount = muscles.length - maxVisible

  const badgeVariant = variant === 'primary' ? 'default' : 'outline'

  return (
    <div className="flex flex-wrap gap-1">
      {visibleMuscles.map((muscle) => (
        <Badge key={muscle} variant={badgeVariant}>
          {muscle}
        </Badge>
      ))}
      {remainingCount > 0 && <Badge variant={badgeVariant}>+{remainingCount} more</Badge>}
    </div>
  )
}
