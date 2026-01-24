import type { MovementPattern, MuscleGroup } from '@strenly/contracts/exercises/muscle-group'
import { useMuscleGroups } from '../hooks/queries/use-muscle-groups'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ExerciseFiltersProps = {
  muscleGroup: MuscleGroup | undefined
  movementPattern: MovementPattern | undefined
  onMuscleGroupChange: (value: MuscleGroup | undefined) => void
  onMovementPatternChange: (value: MovementPattern | undefined) => void
}

const MOVEMENT_PATTERNS: MovementPattern[] = ['push', 'pull', 'squat', 'hinge', 'carry', 'core']

/**
 * Filter dropdowns for muscle group and movement pattern
 */
export function ExerciseFilters({
  muscleGroup,
  movementPattern,
  onMuscleGroupChange,
  onMovementPatternChange,
}: ExerciseFiltersProps) {
  const { data: muscleGroups, isLoading } = useMuscleGroups()

  const handleMuscleGroupChange = (value: string | null) => {
    if (value === 'all') {
      onMuscleGroupChange(undefined)
    } else if (value) {
      onMuscleGroupChange(value as MuscleGroup)
    }
  }

  const handleMovementPatternChange = (value: string | null) => {
    if (value === 'all') {
      onMovementPatternChange(undefined)
    } else if (value) {
      onMovementPatternChange(value as MovementPattern)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={muscleGroup ?? 'all'} onValueChange={handleMuscleGroupChange} disabled={isLoading}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Grupo muscular" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los musculos</SelectItem>
          {muscleGroups?.map((mg) => (
            <SelectItem key={mg.name} value={mg.name}>
              {mg.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={movementPattern ?? 'all'} onValueChange={handleMovementPatternChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Patron de movimiento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los patrones</SelectItem>
          {MOVEMENT_PATTERNS.map((pattern) => (
            <SelectItem key={pattern} value={pattern}>
              {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
