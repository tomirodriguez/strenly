/**
 * Full ProgramAggregate mock matching programAggregateSchema from @strenly/contracts.
 * Built from the seed data in packages/database/src/seed/athletes-programs.ts.
 *
 * Structure: Program → Weeks → Sessions → ExerciseGroups → Items → Series
 * Sessions/groups/items are identical across all weeks; only series differ per week.
 */

type Series = {
  orderIndex: number
  reps: number | null
  repsMax: number | null
  isAmrap: boolean
  intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  intensityValue: number | null
  tempo: string | null
  restSeconds: number | null
}

type GroupItem = {
  id: string
  exerciseId: string
  orderIndex: number
  series: Series[]
}

type ExerciseGroup = {
  id: string
  orderIndex: number
  items: GroupItem[]
}

type Session = {
  id: string
  name: string
  orderIndex: number
  exerciseGroups: ExerciseGroup[]
}

type Week = {
  id: string
  name: string
  orderIndex: number
  sessions: Session[]
}

// ─── Series data by exercise+week (from seed prescriptionsData) ─────

function pctSeries(sets: Array<{ reps: number; pct: number }>): Series[] {
  return sets.map((s, i) => ({
    orderIndex: i,
    reps: s.reps,
    repsMax: null,
    isAmrap: false,
    intensityType: 'percentage',
    intensityValue: s.pct,
    tempo: null,
    restSeconds: null,
  }))
}

function rpeSeries(sets: Array<{ reps: number; repsMax?: number; rpe: number; isAmrap?: boolean }>): Series[] {
  return sets.map((s, i) => ({
    orderIndex: i,
    reps: s.isAmrap ? null : s.reps,
    repsMax: s.repsMax ?? null,
    isAmrap: s.isAmrap ?? false,
    intensityType: 'rpe',
    intensityValue: s.rpe,
    tempo: null,
    restSeconds: null,
  }))
}

// Squat series per week
const squatW1 = pctSeries([
  { reps: 5, pct: 70 },
  { reps: 5, pct: 75 },
  { reps: 5, pct: 80 },
])
const squatW2 = pctSeries([
  { reps: 3, pct: 80 },
  { reps: 3, pct: 85 },
  { reps: 3, pct: 88 },
])
const squatW3 = pctSeries([
  { reps: 2, pct: 90 },
  { reps: 2, pct: 93 },
  { reps: 1, pct: 95 },
])
const squatW4 = pctSeries([
  { reps: 5, pct: 60 },
  { reps: 5, pct: 60 },
])

// Leg Press — week 1 only
const legPressW1 = rpeSeries([
  { reps: 10, repsMax: 12, rpe: 7 },
  { reps: 10, repsMax: 12, rpe: 7 },
  { reps: 10, repsMax: 12, rpe: 8 },
])

// Bench Press
const benchW1 = pctSeries([
  { reps: 5, pct: 72 },
  { reps: 5, pct: 77 },
  { reps: 5, pct: 82 },
])
const benchW2 = pctSeries([
  { reps: 3, pct: 82 },
  { reps: 3, pct: 87 },
  { reps: 2, pct: 90 },
])

// Incline Dumbbell — week 1 only
const inclineW1 = rpeSeries([
  { reps: 8, repsMax: 10, rpe: 7 },
  { reps: 8, repsMax: 10, rpe: 7 },
  { reps: 8, repsMax: 10, rpe: 8 },
])

// Tricep Pushdown — week 1 only
const tricepW1 = rpeSeries([
  { reps: 12, repsMax: 15, rpe: 7 },
  { reps: 12, repsMax: 15, rpe: 7 },
  { reps: 12, repsMax: 15, rpe: 8 },
])

// Deadlift — week 1 only
const deadliftW1 = pctSeries([
  { reps: 5, pct: 68 },
  { reps: 5, pct: 73 },
  { reps: 5, pct: 78 },
])

// Barbell Row — week 1 only
const rowW1 = rpeSeries([
  { reps: 8, rpe: 7 },
  { reps: 8, rpe: 7 },
  { reps: 8, rpe: 8 },
])

// ─── Prescription lookup ────────────────────────────────────

/** Prescriptions indexed by `exerciseItemId:weekId` */
const prescriptions: Record<string, Series[]> = {
  'pex-seed-squat:week-seed-fuerza-w1': squatW1,
  'pex-seed-squat:week-seed-fuerza-w2': squatW2,
  'pex-seed-squat:week-seed-fuerza-w3': squatW3,
  'pex-seed-squat:week-seed-fuerza-w4': squatW4,
  'pex-seed-leg-press:week-seed-fuerza-w1': legPressW1,
  'pex-seed-bench:week-seed-fuerza-w1': benchW1,
  'pex-seed-bench:week-seed-fuerza-w2': benchW2,
  'pex-seed-incline-db:week-seed-fuerza-w1': inclineW1,
  'pex-seed-tricep-push:week-seed-fuerza-w1': tricepW1,
  'pex-seed-deadlift:week-seed-fuerza-w1': deadliftW1,
  'pex-seed-row:week-seed-fuerza-w1': rowW1,
}

// ─── Session/group/item structure (shared across weeks) ─────

type ItemDef = { id: string; exerciseId: string; orderIndex: number }
type GroupDef = { id: string; orderIndex: number; items: ItemDef[] }
type SessionDef = { id: string; name: string; orderIndex: number; groups: GroupDef[] }

const sessionDefs: SessionDef[] = [
  {
    id: 'sess-seed-fuerza-d1',
    name: 'DÍA 1 \u2022 SQUAT',
    orderIndex: 0,
    groups: [
      {
        id: 'eg-seed-fuerza-d1-main',
        orderIndex: 0,
        items: [{ id: 'pex-seed-squat', exerciseId: 'ex-back-squat', orderIndex: 0 }],
      },
      {
        id: 'eg-seed-fuerza-d1-acc',
        orderIndex: 1,
        items: [{ id: 'pex-seed-leg-press', exerciseId: 'ex-leg-press', orderIndex: 0 }],
      },
    ],
  },
  {
    id: 'sess-seed-fuerza-d2',
    name: 'DÍA 2 \u2022 BENCH',
    orderIndex: 1,
    groups: [
      {
        id: 'eg-seed-fuerza-d2-main',
        orderIndex: 0,
        items: [{ id: 'pex-seed-bench', exerciseId: 'ex-barbell-bench-press', orderIndex: 0 }],
      },
      {
        id: 'eg-seed-fuerza-d2-ss',
        orderIndex: 1,
        items: [
          { id: 'pex-seed-incline-db', exerciseId: 'ex-incline-dumbbell-press', orderIndex: 0 },
          { id: 'pex-seed-tricep-push', exerciseId: 'ex-tricep-pushdown', orderIndex: 1 },
        ],
      },
    ],
  },
  {
    id: 'sess-seed-fuerza-d3',
    name: 'DÍA 3 \u2022 DEADLIFT',
    orderIndex: 2,
    groups: [
      {
        id: 'eg-seed-fuerza-d3-main',
        orderIndex: 0,
        items: [{ id: 'pex-seed-deadlift', exerciseId: 'ex-conventional-deadlift', orderIndex: 0 }],
      },
      {
        id: 'eg-seed-fuerza-d3-acc',
        orderIndex: 1,
        items: [{ id: 'pex-seed-row', exerciseId: 'ex-barbell-row', orderIndex: 0 }],
      },
    ],
  },
]

const weekDefs = [
  { id: 'week-seed-fuerza-w1', name: 'Semana 1 - Acumulación', orderIndex: 0 },
  { id: 'week-seed-fuerza-w2', name: 'Semana 2 - Intensificación', orderIndex: 1 },
  { id: 'week-seed-fuerza-w3', name: 'Semana 3 - Realización', orderIndex: 2 },
  { id: 'week-seed-fuerza-w4', name: 'Semana 4 - Deload', orderIndex: 3 },
]

// ─── Build aggregate ────────────────────────────────────────

function buildWeek(weekDef: (typeof weekDefs)[number]): Week {
  const sessions: Session[] = sessionDefs.map((s) => ({
    id: s.id,
    name: s.name,
    orderIndex: s.orderIndex,
    exerciseGroups: s.groups.map((g) => ({
      id: g.id,
      orderIndex: g.orderIndex,
      items: g.items.map((item) => ({
        id: item.id,
        exerciseId: item.exerciseId,
        orderIndex: item.orderIndex,
        series: prescriptions[`${item.id}:${weekDef.id}`] ?? [],
      })),
    })),
  }))

  return {
    id: weekDef.id,
    name: weekDef.name,
    orderIndex: weekDef.orderIndex,
    sessions,
  }
}

/** Full ProgramAggregate matching the Fuerza program seed data */
export const MOCK_PROGRAM = {
  id: 'prg-seed-fuerza-001',
  organizationId: 'org-seed-test-001',
  name: 'Fuerza Máxima - Fase 1',
  description: 'Programa de 4 semanas para desarrollo de fuerza máxima en los 3 levantamientos principales.',
  athleteId: 'ath-seed-carlos-001',
  isTemplate: false,
  status: 'active',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  weeks: weekDefs.map(buildWeek),
}
