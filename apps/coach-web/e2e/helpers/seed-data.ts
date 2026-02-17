/**
 * Constants matching the seed data in packages/database/src/seed/athletes-programs.ts.
 * These are used by E2E tests to assert against known grid state.
 */

export const TEST_USER = {
  email: 'test@strenly.app',
  password: 'test123',
}

export const ORG_SLUG = 'test'

export const PROGRAM = {
  id: 'prg-seed-fuerza-001',
  name: 'Fuerza Máxima - Fase 1',
  url: `/test/programs/prg-seed-fuerza-001`,
}

export const WEEKS_COUNT = 4

export const SESSIONS = ['DÍA 1 \u2022 SQUAT', 'DÍA 2 \u2022 BENCH', 'DÍA 3 \u2022 DEADLIFT'] as const

/**
 * Exercises organized by session, in display order.
 * These match the seed data exercise names exactly.
 */
export const EXERCISES = {
  session1: ['Back Squat', 'Leg Press'],
  session2: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Tricep Pushdown'],
  session3: ['Conventional Deadlift', 'Barbell Row'],
} as const

/** All exercises in grid order (excluding session headers and empty rows) */
export const ALL_EXERCISES = [...EXERCISES.session1, ...EXERCISES.session2, ...EXERCISES.session3] as const

/** Total exercise rows across all sessions (includes empty placeholder rows, one per session) */
export const TOTAL_EXERCISE_ROWS = ALL_EXERCISES.length + SESSIONS.length // 10

/**
 * Superset in session 2: Incline Dumbbell Press + Tricep Pushdown
 */
export const SUPERSET = {
  session: 'DÍA 2 \u2022 BENCH',
  exercises: ['Incline Dumbbell Press', 'Tricep Pushdown'],
} as const
