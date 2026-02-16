/**
 * Mock exercise data for E2E tests.
 * Covers the 7 exercises in the program plus extras for search tests.
 */

type MockExercise = {
  id: string
  organizationId: string | null
  name: string
  description: string | null
  instructions: string | null
  videoUrl: string | null
  movementPattern: string | null
  isUnilateral: boolean
  isCurated: boolean
  clonedFromId: string | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

function exercise(
  id: string,
  name: string,
  pattern: string | null,
  primary: string[],
  secondary: string[] = [],
): MockExercise {
  return {
    id,
    organizationId: null,
    name,
    description: null,
    instructions: null,
    videoUrl: null,
    movementPattern: pattern,
    isUnilateral: false,
    isCurated: true,
    clonedFromId: null,
    primaryMuscles: primary,
    secondaryMuscles: secondary,
    archivedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  }
}

/** All mock exercises — the 7 in the program + extras for search tests */
export const MOCK_EXERCISES: MockExercise[] = [
  // In the program (seed IDs)
  exercise('ex-back-squat', 'Back Squat', 'squat', ['quads', 'glutes']),
  exercise('ex-leg-press', 'Leg Press', 'squat', ['quads'], ['glutes']),
  exercise('ex-barbell-bench-press', 'Barbell Bench Press', 'push', ['chest'], ['triceps', 'shoulders']),
  exercise('ex-incline-dumbbell-press', 'Incline Dumbbell Press', 'push', ['chest'], ['shoulders', 'triceps']),
  exercise('ex-tricep-pushdown', 'Tricep Pushdown', 'push', ['triceps']),
  exercise('ex-conventional-deadlift', 'Conventional Deadlift', 'hinge', ['hamstrings', 'back', 'glutes']),
  exercise('ex-barbell-row', 'Barbell Row', 'pull', ['back'], ['biceps']),
  // Extras for search tests
  exercise('ex-romanian-deadlift', 'Romanian Deadlift', 'hinge', ['hamstrings', 'glutes']),
  exercise('ex-front-squat', 'Front Squat', 'squat', ['quads'], ['core']),
  exercise('ex-dumbbell-bench-press', 'Dumbbell Bench Press', 'push', ['chest'], ['triceps', 'shoulders']),
  exercise('ex-dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'push', ['shoulders'], ['triceps']),
  exercise('ex-lat-pulldown', 'Lat Pulldown', 'pull', ['back'], ['biceps']),
  exercise('ex-seated-cable-row', 'Seated Cable Row', 'pull', ['back'], ['biceps']),
  exercise('ex-leg-curl', 'Leg Curl', 'hinge', ['hamstrings']),
  exercise('ex-hip-thrust', 'Hip Thrust', 'hinge', ['glutes'], ['hamstrings']),
]

/**
 * Filter exercises by search term (case-insensitive name match).
 * Returns { items, totalCount } matching the API response shape.
 */
export function filterExercises(search?: string, limit = 100) {
  let filtered = MOCK_EXERCISES
  if (search) {
    const lower = search.toLowerCase()
    filtered = MOCK_EXERCISES.filter((e) => e.name.toLowerCase().includes(lower))
  }
  const items = filtered.slice(0, limit)
  return { items, totalCount: filtered.length }
}
