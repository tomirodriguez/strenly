import {
  type MovementPattern,
  type MuscleGroup,
  movementPatternSchema,
  muscleGroupSchema,
} from '@strenly/contracts/exercises/muscle-group'
import { useMemo } from 'react'
import { useMuscleGroups } from '../hooks/queries/use-muscle-groups'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ExerciseFiltersProps = {
  muscleGroup: MuscleGroup | undefined
  movementPattern: MovementPattern | undefined
  onMuscleGroupChange: (value: MuscleGroup | undefined) => void
  onMovementPatternChange: (value: MovementPattern | undefined) => void
}

const MOVEMENT_PATTERN_OPTIONS = [
  { value: 'all', label: 'Todos los patrones' },
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'squat', label: 'Squat' },
  { value: 'hinge', label: 'Hinge' },
  { value: 'carry', label: 'Carry' },
  { value: 'core', label: 'Core' },
]

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

  const muscleGroupItems = useMemo(
    () => [
      { value: 'all', label: 'Todos los musculos' },
      ...(muscleGroups?.map((mg) => ({ value: mg.name, label: mg.displayName })) ?? []),
    ],
    [muscleGroups],
  )

  const handleMuscleGroupChange = (value: string | null) => {
    if (value === 'all') {
      onMuscleGroupChange(undefined)
    } else if (value) {
      const parsed = muscleGroupSchema.safeParse(value)
      if (parsed.success) {
        onMuscleGroupChange(parsed.data)
      }
    }
  }

  const handleMovementPatternChange = (value: string | null) => {
    if (value === 'all') {
      onMovementPatternChange(undefined)
    } else if (value) {
      const parsed = movementPatternSchema.safeParse(value)
      if (parsed.success) {
        onMovementPatternChange(parsed.data)
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        items={muscleGroupItems}
        value={muscleGroup ?? 'all'}
        onValueChange={handleMuscleGroupChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Grupo muscular" />
        </SelectTrigger>
        <SelectContent>
          {muscleGroupItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={MOVEMENT_PATTERN_OPTIONS}
        value={movementPattern ?? 'all'}
        onValueChange={handleMovementPatternChange}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Patron de movimiento" />
        </SelectTrigger>
        <SelectContent>
          {MOVEMENT_PATTERN_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
