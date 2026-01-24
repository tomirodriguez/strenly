import type { DbClient } from '../client'
import { exerciseMuscles } from '../schema/exercise-muscles'
import { exercises } from '../schema/exercises'

type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'core'
  | 'calves'
type MovementPattern = 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'core'

interface ExerciseSeedData {
  id: string
  name: string
  description: string
  movementPattern: MovementPattern
  isUnilateral: boolean
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
}

/**
 * Curated exercises seed data
 * 60 common strength training exercises organized by movement pattern
 */
export const EXERCISES_DATA: ExerciseSeedData[] = [
  // ============================================
  // PUSH EXERCISES (15)
  // ============================================
  {
    id: 'ex-barbell-bench-press',
    name: 'Barbell Bench Press',
    description: 'Horizontal pressing movement for chest development',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
  },
  {
    id: 'ex-incline-barbell-bench-press',
    name: 'Incline Barbell Bench Press',
    description: 'Upper chest focused pressing movement on an inclined bench',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
  },
  {
    id: 'ex-dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    description: 'Horizontal pressing with dumbbells for balanced development',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
  },
  {
    id: 'ex-incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    description: 'Upper chest pressing with dumbbells on incline',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
  },
  {
    id: 'ex-overhead-press',
    name: 'Overhead Press',
    description: 'Standing barbell press for shoulder strength',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
  },
  {
    id: 'ex-dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    description: 'Seated or standing dumbbell press for shoulders',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
  },
  {
    id: 'ex-dips',
    name: 'Dips',
    description: 'Bodyweight pressing movement for chest and triceps',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
  },
  {
    id: 'ex-push-ups',
    name: 'Push-Ups',
    description: 'Fundamental bodyweight horizontal pressing',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'core'],
  },
  {
    id: 'ex-close-grip-bench-press',
    name: 'Close-Grip Bench Press',
    description: 'Triceps-focused bench press with narrow grip',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
  },
  {
    id: 'ex-tricep-pushdown',
    name: 'Tricep Pushdown',
    description: 'Cable isolation for triceps',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-skull-crushers',
    name: 'Skull Crushers',
    description: 'Lying triceps extension with barbell or EZ bar',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-lateral-raise',
    name: 'Lateral Raise',
    description: 'Dumbbell isolation for lateral deltoids',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-front-raise',
    name: 'Front Raise',
    description: 'Dumbbell isolation for anterior deltoids',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-arnold-press',
    name: 'Arnold Press',
    description: 'Rotating dumbbell shoulder press for full deltoid activation',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
  },
  {
    id: 'ex-decline-bench-press',
    name: 'Decline Bench Press',
    description: 'Lower chest focused pressing on decline bench',
    movementPattern: 'push',
    isUnilateral: false,
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
  },

  // ============================================
  // PULL EXERCISES (15)
  // ============================================
  {
    id: 'ex-barbell-row',
    name: 'Barbell Row',
    description: 'Horizontal pulling for back thickness',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
  },
  {
    id: 'ex-dumbbell-row',
    name: 'Dumbbell Row',
    description: 'Single-arm horizontal pulling for back',
    movementPattern: 'pull',
    isUnilateral: true,
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
  },
  {
    id: 'ex-pull-ups',
    name: 'Pull-Ups',
    description: 'Vertical pulling bodyweight movement',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
  },
  {
    id: 'ex-chin-ups',
    name: 'Chin-Ups',
    description: 'Supinated grip pull-ups with more bicep engagement',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['back', 'biceps'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    description: 'Cable vertical pulling for lats',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
  },
  {
    id: 'ex-seated-cable-row',
    name: 'Seated Cable Row',
    description: 'Cable horizontal pulling for back thickness',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
  },
  {
    id: 'ex-face-pull',
    name: 'Face Pull',
    description: 'Cable pull to face for rear deltoids and external rotation',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['shoulders', 'back'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-barbell-curl',
    name: 'Barbell Curl',
    description: 'Standing barbell bicep curl',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-dumbbell-curl',
    name: 'Dumbbell Curl',
    description: 'Standing or seated dumbbell bicep curl',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-hammer-curl',
    name: 'Hammer Curl',
    description: 'Neutral grip dumbbell curl for brachialis',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-pendlay-row',
    name: 'Pendlay Row',
    description: 'Strict barbell row from floor for explosive pulling',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
  },
  {
    id: 'ex-t-bar-row',
    name: 'T-Bar Row',
    description: 'Landmine or machine row for back thickness',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
  },
  {
    id: 'ex-reverse-fly',
    name: 'Reverse Fly',
    description: 'Dumbbell or cable rear deltoid isolation',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
  },
  {
    id: 'ex-preacher-curl',
    name: 'Preacher Curl',
    description: 'Bicep curl with arm support for strict form',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-cable-curl',
    name: 'Cable Curl',
    description: 'Standing cable bicep curl with constant tension',
    movementPattern: 'pull',
    isUnilateral: false,
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
  },

  // ============================================
  // SQUAT EXERCISES (10)
  // ============================================
  {
    id: 'ex-back-squat',
    name: 'Back Squat',
    description: 'Fundamental lower body compound movement',
    movementPattern: 'squat',
    isUnilateral: false,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
  },
  {
    id: 'ex-front-squat',
    name: 'Front Squat',
    description: 'Quad-dominant squat with barbell in front rack position',
    movementPattern: 'squat',
    isUnilateral: false,
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'core'],
  },
  {
    id: 'ex-goblet-squat',
    name: 'Goblet Squat',
    description: 'Dumbbell or kettlebell squat held at chest',
    movementPattern: 'squat',
    isUnilateral: false,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['core'],
  },
  {
    id: 'ex-leg-press',
    name: 'Leg Press',
    description: 'Machine compound movement for quadriceps and glutes',
    movementPattern: 'squat',
    isUnilateral: false,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
  },
  {
    id: 'ex-walking-lunge',
    name: 'Walking Lunge',
    description: 'Dynamic unilateral leg movement',
    movementPattern: 'squat',
    isUnilateral: true,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    description: 'Elevated rear foot single-leg squat',
    movementPattern: 'squat',
    isUnilateral: true,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension',
    description: 'Machine isolation for quadriceps',
    movementPattern: 'squat',
    isUnilateral: false,
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-hack-squat',
    name: 'Hack Squat',
    description: 'Machine squat with back support',
    movementPattern: 'squat',
    isUnilateral: false,
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes'],
  },
  {
    id: 'ex-step-up',
    name: 'Step-Up',
    description: 'Single-leg elevation exercise for quads and glutes',
    movementPattern: 'squat',
    isUnilateral: true,
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
  },
  {
    id: 'ex-sissy-squat',
    name: 'Sissy Squat',
    description: 'Quad isolation with backward lean',
    movementPattern: 'squat',
    isUnilateral: false,
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
  },

  // ============================================
  // HINGE EXERCISES (10)
  // ============================================
  {
    id: 'ex-conventional-deadlift',
    name: 'Conventional Deadlift',
    description: 'Hip hinge movement for posterior chain development',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['hamstrings', 'glutes', 'back'],
    secondaryMuscles: ['core'],
  },
  {
    id: 'ex-sumo-deadlift',
    name: 'Sumo Deadlift',
    description: 'Wide stance deadlift with more quad engagement',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['glutes', 'hamstrings', 'back'],
    secondaryMuscles: ['quads', 'core'],
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Romanian Deadlift',
    description: 'Hip hinge with slight knee bend for hamstring focus',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back', 'core'],
  },
  {
    id: 'ex-stiff-leg-deadlift',
    name: 'Stiff-Leg Deadlift',
    description: 'Deadlift with minimal knee bend for hamstring stretch',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['glutes', 'back'],
  },
  {
    id: 'ex-hip-thrust',
    name: 'Hip Thrust',
    description: 'Glute-focused hip extension with back on bench',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
  },
  {
    id: 'ex-glute-bridge',
    name: 'Glute Bridge',
    description: 'Floor-based hip extension for glutes',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
  },
  {
    id: 'ex-good-morning',
    name: 'Good Morning',
    description: 'Barbell hip hinge with bar on shoulders',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['hamstrings', 'back'],
    secondaryMuscles: ['glutes', 'core'],
  },
  {
    id: 'ex-leg-curl',
    name: 'Leg Curl',
    description: 'Machine isolation for hamstrings',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-single-leg-rdl',
    name: 'Single-Leg Romanian Deadlift',
    description: 'Unilateral RDL for balance and hamstring development',
    movementPattern: 'hinge',
    isUnilateral: true,
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['core'],
  },
  {
    id: 'ex-kettlebell-swing',
    name: 'Kettlebell Swing',
    description: 'Explosive hip hinge for power and conditioning',
    movementPattern: 'hinge',
    isUnilateral: false,
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['core', 'shoulders'],
  },

  // ============================================
  // CORE EXERCISES (5)
  // ============================================
  {
    id: 'ex-plank',
    name: 'Plank',
    description: 'Isometric core stabilization',
    movementPattern: 'core',
    isUnilateral: false,
    primaryMuscles: ['core'],
    secondaryMuscles: ['shoulders'],
  },
  {
    id: 'ex-ab-wheel-rollout',
    name: 'Ab Wheel Rollout',
    description: 'Anti-extension core exercise with wheel',
    movementPattern: 'core',
    isUnilateral: false,
    primaryMuscles: ['core'],
    secondaryMuscles: ['shoulders'],
  },
  {
    id: 'ex-pallof-press',
    name: 'Pallof Press',
    description: 'Anti-rotation cable press for core stability',
    movementPattern: 'core',
    isUnilateral: false,
    primaryMuscles: ['core'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    description: 'Hanging hip flexion for lower abs',
    movementPattern: 'core',
    isUnilateral: false,
    primaryMuscles: ['core'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-cable-crunch',
    name: 'Cable Crunch',
    description: 'Weighted cable flexion for abs',
    movementPattern: 'core',
    isUnilateral: false,
    primaryMuscles: ['core'],
    secondaryMuscles: [],
  },

  // ============================================
  // CARRY EXERCISES (5)
  // ============================================
  {
    id: 'ex-farmers-walk',
    name: "Farmer's Walk",
    description: 'Loaded carry with dumbbells or handles for grip and core',
    movementPattern: 'carry',
    isUnilateral: false,
    primaryMuscles: ['core'],
    secondaryMuscles: ['shoulders', 'back'],
  },
  {
    id: 'ex-suitcase-carry',
    name: 'Suitcase Carry',
    description: 'Single-arm loaded carry for anti-lateral flexion',
    movementPattern: 'carry',
    isUnilateral: true,
    primaryMuscles: ['core'],
    secondaryMuscles: ['shoulders'],
  },
  {
    id: 'ex-overhead-carry',
    name: 'Overhead Carry',
    description: 'Walking with weight held overhead for shoulder stability',
    movementPattern: 'carry',
    isUnilateral: false,
    primaryMuscles: ['shoulders', 'core'],
    secondaryMuscles: [],
  },
  {
    id: 'ex-rack-carry',
    name: 'Rack Carry',
    description: 'Front rack position carry for core and upper back',
    movementPattern: 'carry',
    isUnilateral: false,
    primaryMuscles: ['core'],
    secondaryMuscles: ['shoulders', 'back'],
  },
  {
    id: 'ex-yoke-walk',
    name: 'Yoke Walk',
    description: 'Heavy loaded carry with yoke bar for total body strength',
    movementPattern: 'carry',
    isUnilateral: false,
    primaryMuscles: ['core', 'back'],
    secondaryMuscles: ['quads', 'glutes'],
  },
]

/**
 * Seeds exercises and their muscle mappings into the database
 * Uses onConflictDoNothing for idempotency
 */
export async function seedExercises(db: DbClient): Promise<void> {
  // Prepare all exercises for bulk insert
  const exerciseValues = EXERCISES_DATA.map((ex) => ({
    id: ex.id,
    organizationId: null, // curated = null
    name: ex.name,
    description: ex.description,
    movementPattern: ex.movementPattern,
    isUnilateral: ex.isUnilateral,
    isCurated: true,
  }))

  // Prepare all muscle mappings for bulk insert
  const muscleValues: { exerciseId: string; muscleGroupId: string; isPrimary: boolean }[] = []

  for (const ex of EXERCISES_DATA) {
    for (const mg of ex.primaryMuscles) {
      muscleValues.push({
        exerciseId: ex.id,
        muscleGroupId: `mg-${mg}`,
        isPrimary: true,
      })
    }
    for (const mg of ex.secondaryMuscles) {
      muscleValues.push({
        exerciseId: ex.id,
        muscleGroupId: `mg-${mg}`,
        isPrimary: false,
      })
    }
  }

  // Bulk insert exercises (1 query instead of 60)
  await db.insert(exercises).values(exerciseValues).onConflictDoNothing({ target: exercises.id })

  // Bulk insert muscle mappings (1 query instead of ~200+)
  await db.insert(exerciseMuscles).values(muscleValues).onConflictDoNothing()

  console.log(`Seeded ${EXERCISES_DATA.length} exercises with ${muscleValues.length} muscle mappings`)
}
