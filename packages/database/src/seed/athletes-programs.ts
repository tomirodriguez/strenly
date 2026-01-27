import type { DbClient } from '../client'
import { athletes } from '../schema/athletes'
import { exerciseGroups } from '../schema/exercise-groups'
import type { LoggedSeriesData } from '../schema/logged-exercises'
import { loggedExercises } from '../schema/logged-exercises'
import type { PrescriptionSeriesData } from '../schema/prescriptions'
import { prescriptions } from '../schema/prescriptions'
import { programExercises } from '../schema/program-exercises'
import { programSessions } from '../schema/program-sessions'
import { programWeeks } from '../schema/program-weeks'
import { programs } from '../schema/programs'
import { workoutLogs } from '../schema/workout-logs'

/**
 * Seed data for testing workout logging feature
 *
 * Creates:
 * - 3 athletes with Spanish names
 * - 2 programs with weeks, sessions, exercise groups, and exercises
 * - Program assignments to athletes
 * - Some completed workout logs for history testing
 */

// Fixed IDs for consistent seeding
const SEED_ORG_ID = 'org-seed-test-001'

// Athletes
const ATHLETE_IDS = {
  carlos: 'ath-seed-carlos-001',
  maria: 'ath-seed-maria-002',
  diego: 'ath-seed-diego-003',
}

// Programs
const PROGRAM_IDS = {
  fuerza: 'prg-seed-fuerza-001',
  hipertrofia: 'prg-seed-hipertrofia-002',
}

// Weeks
const WEEK_IDS = {
  fuerza: {
    week1: 'week-seed-fuerza-w1',
    week2: 'week-seed-fuerza-w2',
    week3: 'week-seed-fuerza-w3',
    week4: 'week-seed-fuerza-w4',
  },
  hipertrofia: {
    week1: 'week-seed-hiper-w1',
    week2: 'week-seed-hiper-w2',
    week3: 'week-seed-hiper-w3',
  },
}

// Sessions
const SESSION_IDS = {
  fuerza: {
    day1: 'sess-seed-fuerza-d1',
    day2: 'sess-seed-fuerza-d2',
    day3: 'sess-seed-fuerza-d3',
  },
  hipertrofia: {
    upper: 'sess-seed-hiper-upper',
    lower: 'sess-seed-hiper-lower',
  },
}

// Exercise Groups
const GROUP_IDS = {
  fuerza: {
    d1_main: 'eg-seed-fuerza-d1-main',
    d1_accessory: 'eg-seed-fuerza-d1-acc',
    d2_main: 'eg-seed-fuerza-d2-main',
    d2_superset: 'eg-seed-fuerza-d2-ss',
    d3_main: 'eg-seed-fuerza-d3-main',
    d3_accessory: 'eg-seed-fuerza-d3-acc',
  },
  hipertrofia: {
    upper_push: 'eg-seed-hiper-upper-push',
    upper_pull: 'eg-seed-hiper-upper-pull',
    lower_main: 'eg-seed-hiper-lower-main',
    lower_acc: 'eg-seed-hiper-lower-acc',
  },
}

// Program Exercises
const PROGRAM_EXERCISE_IDS = {
  fuerza: {
    squat: 'pex-seed-squat',
    leg_press: 'pex-seed-leg-press',
    bench: 'pex-seed-bench',
    incline_db: 'pex-seed-incline-db',
    tricep_push: 'pex-seed-tricep-push',
    deadlift: 'pex-seed-deadlift',
    row: 'pex-seed-row',
  },
  hipertrofia: {
    bench: 'pex-seed-hiper-bench',
    shoulder_press: 'pex-seed-hiper-shoulder',
    lat_pull: 'pex-seed-hiper-lat',
    cable_row: 'pex-seed-hiper-row',
    squat: 'pex-seed-hiper-squat',
    rdl: 'pex-seed-hiper-rdl',
    leg_curl: 'pex-seed-hiper-curl',
  },
}

// Workout Logs
const LOG_IDS = {
  carlos_d1_w1: 'log-seed-carlos-d1-w1',
  carlos_d2_w1: 'log-seed-carlos-d2-w1',
  maria_upper_w1: 'log-seed-maria-upper-w1',
}

// Logged Exercises
const LOGGED_EXERCISE_IDS = {
  carlos_squat: 'lex-seed-carlos-squat',
  carlos_leg_press: 'lex-seed-carlos-leg-press',
  carlos_bench: 'lex-seed-carlos-bench',
  maria_bench: 'lex-seed-maria-bench',
  maria_shoulder: 'lex-seed-maria-shoulder',
}

// Exercise IDs from curated exercises seed
const EXERCISE_IDS = {
  backSquat: 'ex-back-squat',
  legPress: 'ex-leg-press',
  benchPress: 'ex-barbell-bench-press',
  inclineDumbbell: 'ex-incline-dumbbell-press',
  tricepPushdown: 'ex-tricep-pushdown',
  conventionalDeadlift: 'ex-conventional-deadlift',
  barbellRow: 'ex-barbell-row',
  shoulderPress: 'ex-dumbbell-shoulder-press',
  latPulldown: 'ex-lat-pulldown',
  seatedCableRow: 'ex-seated-cable-row',
  romanianDeadlift: 'ex-romanian-deadlift',
  legCurl: 'ex-leg-curl',
}

/**
 * Athletes seed data
 * 3 athletes with Spanish names and different profiles
 */
const athletesData = [
  {
    id: ATHLETE_IDS.carlos,
    organizationId: SEED_ORG_ID,
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+34 612 345 678',
    birthdate: '1995-03-15',
    gender: 'male' as const,
    notes: 'Powerlifter competitivo. Lesión de hombro hace 2 años, recuperado.',
    status: 'active' as const,
  },
  {
    id: ATHLETE_IDS.maria,
    organizationId: SEED_ORG_ID,
    name: 'María García López',
    email: 'maria.garcia@email.com',
    phone: '+34 623 456 789',
    birthdate: '1998-07-22',
    gender: 'female' as const,
    notes: 'Objetivo: hipertrofia y composición corporal. Entrena 4x semana.',
    status: 'active' as const,
  },
  {
    id: ATHLETE_IDS.diego,
    organizationId: SEED_ORG_ID,
    name: 'Diego Martínez Sánchez',
    email: 'diego.martinez@email.com',
    phone: '+34 634 567 890',
    birthdate: '1990-11-08',
    gender: 'male' as const,
    notes: 'Atleta master, 35 años. Foco en mantener fuerza y prevenir lesiones.',
    status: 'active' as const,
  },
]

/**
 * Programs seed data
 * 2 programs: one for strength (assigned to Carlos), one for hypertrophy (assigned to María)
 */
const programsData = [
  {
    id: PROGRAM_IDS.fuerza,
    organizationId: SEED_ORG_ID,
    name: 'Fuerza Máxima - Fase 1',
    description: 'Programa de 4 semanas para desarrollo de fuerza máxima en los 3 levantamientos principales.',
    athleteId: ATHLETE_IDS.carlos,
    isTemplate: false,
    status: 'active' as const,
  },
  {
    id: PROGRAM_IDS.hipertrofia,
    organizationId: SEED_ORG_ID,
    name: 'Hipertrofia Upper/Lower',
    description: 'Programa de 3 semanas enfocado en hipertrofia con división upper/lower.',
    athleteId: ATHLETE_IDS.maria,
    isTemplate: false,
    status: 'active' as const,
  },
]

/**
 * Program weeks seed data
 */
const weeksData = [
  // Fuerza program - 4 weeks
  { id: WEEK_IDS.fuerza.week1, programId: PROGRAM_IDS.fuerza, name: 'Semana 1 - Acumulación', orderIndex: 0 },
  { id: WEEK_IDS.fuerza.week2, programId: PROGRAM_IDS.fuerza, name: 'Semana 2 - Intensificación', orderIndex: 1 },
  { id: WEEK_IDS.fuerza.week3, programId: PROGRAM_IDS.fuerza, name: 'Semana 3 - Realización', orderIndex: 2 },
  { id: WEEK_IDS.fuerza.week4, programId: PROGRAM_IDS.fuerza, name: 'Semana 4 - Deload', orderIndex: 3 },
  // Hipertrofia program - 3 weeks
  { id: WEEK_IDS.hipertrofia.week1, programId: PROGRAM_IDS.hipertrofia, name: 'Semana 1', orderIndex: 0 },
  { id: WEEK_IDS.hipertrofia.week2, programId: PROGRAM_IDS.hipertrofia, name: 'Semana 2', orderIndex: 1 },
  { id: WEEK_IDS.hipertrofia.week3, programId: PROGRAM_IDS.hipertrofia, name: 'Semana 3', orderIndex: 2 },
]

/**
 * Program sessions seed data
 */
const sessionsData = [
  // Fuerza program - 3 days
  { id: SESSION_IDS.fuerza.day1, programId: PROGRAM_IDS.fuerza, name: 'DÍA 1 • SQUAT', orderIndex: 0 },
  { id: SESSION_IDS.fuerza.day2, programId: PROGRAM_IDS.fuerza, name: 'DÍA 2 • BENCH', orderIndex: 1 },
  { id: SESSION_IDS.fuerza.day3, programId: PROGRAM_IDS.fuerza, name: 'DÍA 3 • DEADLIFT', orderIndex: 2 },
  // Hipertrofia program - 2 days
  { id: SESSION_IDS.hipertrofia.upper, programId: PROGRAM_IDS.hipertrofia, name: 'UPPER BODY', orderIndex: 0 },
  { id: SESSION_IDS.hipertrofia.lower, programId: PROGRAM_IDS.hipertrofia, name: 'LOWER BODY', orderIndex: 1 },
]

/**
 * Exercise groups seed data
 */
const exerciseGroupsData = [
  // Fuerza Day 1 - Squat
  { id: GROUP_IDS.fuerza.d1_main, sessionId: SESSION_IDS.fuerza.day1, orderIndex: 0, name: 'Bloque Principal' },
  { id: GROUP_IDS.fuerza.d1_accessory, sessionId: SESSION_IDS.fuerza.day1, orderIndex: 1, name: 'Accesorios' },
  // Fuerza Day 2 - Bench
  { id: GROUP_IDS.fuerza.d2_main, sessionId: SESSION_IDS.fuerza.day2, orderIndex: 0, name: 'Bloque Principal' },
  { id: GROUP_IDS.fuerza.d2_superset, sessionId: SESSION_IDS.fuerza.day2, orderIndex: 1, name: null }, // Superset with auto-letter
  // Fuerza Day 3 - Deadlift
  { id: GROUP_IDS.fuerza.d3_main, sessionId: SESSION_IDS.fuerza.day3, orderIndex: 0, name: 'Bloque Principal' },
  { id: GROUP_IDS.fuerza.d3_accessory, sessionId: SESSION_IDS.fuerza.day3, orderIndex: 1, name: 'Accesorios' },
  // Hipertrofia Upper
  { id: GROUP_IDS.hipertrofia.upper_push, sessionId: SESSION_IDS.hipertrofia.upper, orderIndex: 0, name: 'Push' },
  { id: GROUP_IDS.hipertrofia.upper_pull, sessionId: SESSION_IDS.hipertrofia.upper, orderIndex: 1, name: 'Pull' },
  // Hipertrofia Lower
  { id: GROUP_IDS.hipertrofia.lower_main, sessionId: SESSION_IDS.hipertrofia.lower, orderIndex: 0, name: 'Compuestos' },
  { id: GROUP_IDS.hipertrofia.lower_acc, sessionId: SESSION_IDS.hipertrofia.lower, orderIndex: 1, name: 'Aislamiento' },
]

/**
 * Program exercises seed data
 */
const programExercisesData = [
  // Fuerza Day 1 - Squat
  {
    id: PROGRAM_EXERCISE_IDS.fuerza.squat,
    sessionId: SESSION_IDS.fuerza.day1,
    exerciseId: EXERCISE_IDS.backSquat,
    orderIndex: 0,
    groupId: GROUP_IDS.fuerza.d1_main,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: 'Trabajo en pausa al fondo',
    restSeconds: 180,
  },
  {
    id: PROGRAM_EXERCISE_IDS.fuerza.leg_press,
    sessionId: SESSION_IDS.fuerza.day1,
    exerciseId: EXERCISE_IDS.legPress,
    orderIndex: 1,
    groupId: GROUP_IDS.fuerza.d1_accessory,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: null,
    restSeconds: 120,
  },
  // Fuerza Day 2 - Bench
  {
    id: PROGRAM_EXERCISE_IDS.fuerza.bench,
    sessionId: SESSION_IDS.fuerza.day2,
    exerciseId: EXERCISE_IDS.benchPress,
    orderIndex: 0,
    groupId: GROUP_IDS.fuerza.d2_main,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: 'Pausa en el pecho en cada rep',
    restSeconds: 180,
  },
  {
    id: PROGRAM_EXERCISE_IDS.fuerza.incline_db,
    sessionId: SESSION_IDS.fuerza.day2,
    exerciseId: EXERCISE_IDS.inclineDumbbell,
    orderIndex: 1,
    groupId: GROUP_IDS.fuerza.d2_superset,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: null,
    restSeconds: 60,
  },
  {
    id: PROGRAM_EXERCISE_IDS.fuerza.tricep_push,
    sessionId: SESSION_IDS.fuerza.day2,
    exerciseId: EXERCISE_IDS.tricepPushdown,
    orderIndex: 2,
    groupId: GROUP_IDS.fuerza.d2_superset,
    orderWithinGroup: 1,
    setTypeLabel: null,
    notes: null,
    restSeconds: 90,
  },
  // Fuerza Day 3 - Deadlift
  {
    id: PROGRAM_EXERCISE_IDS.fuerza.deadlift,
    sessionId: SESSION_IDS.fuerza.day3,
    exerciseId: EXERCISE_IDS.conventionalDeadlift,
    orderIndex: 0,
    groupId: GROUP_IDS.fuerza.d3_main,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: 'Desde el piso, sin touch and go',
    restSeconds: 240,
  },
  {
    id: PROGRAM_EXERCISE_IDS.fuerza.row,
    sessionId: SESSION_IDS.fuerza.day3,
    exerciseId: EXERCISE_IDS.barbellRow,
    orderIndex: 1,
    groupId: GROUP_IDS.fuerza.d3_accessory,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: null,
    restSeconds: 120,
  },
  // Hipertrofia Upper
  {
    id: PROGRAM_EXERCISE_IDS.hipertrofia.bench,
    sessionId: SESSION_IDS.hipertrofia.upper,
    exerciseId: EXERCISE_IDS.benchPress,
    orderIndex: 0,
    groupId: GROUP_IDS.hipertrofia.upper_push,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: 'Tempo 3-0-1-0',
    restSeconds: 90,
  },
  {
    id: PROGRAM_EXERCISE_IDS.hipertrofia.shoulder_press,
    sessionId: SESSION_IDS.hipertrofia.upper,
    exerciseId: EXERCISE_IDS.shoulderPress,
    orderIndex: 1,
    groupId: GROUP_IDS.hipertrofia.upper_push,
    orderWithinGroup: 1,
    setTypeLabel: null,
    notes: null,
    restSeconds: 90,
  },
  {
    id: PROGRAM_EXERCISE_IDS.hipertrofia.lat_pull,
    sessionId: SESSION_IDS.hipertrofia.upper,
    exerciseId: EXERCISE_IDS.latPulldown,
    orderIndex: 2,
    groupId: GROUP_IDS.hipertrofia.upper_pull,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: null,
    restSeconds: 90,
  },
  {
    id: PROGRAM_EXERCISE_IDS.hipertrofia.cable_row,
    sessionId: SESSION_IDS.hipertrofia.upper,
    exerciseId: EXERCISE_IDS.seatedCableRow,
    orderIndex: 3,
    groupId: GROUP_IDS.hipertrofia.upper_pull,
    orderWithinGroup: 1,
    setTypeLabel: null,
    notes: null,
    restSeconds: 90,
  },
  // Hipertrofia Lower
  {
    id: PROGRAM_EXERCISE_IDS.hipertrofia.squat,
    sessionId: SESSION_IDS.hipertrofia.lower,
    exerciseId: EXERCISE_IDS.backSquat,
    orderIndex: 0,
    groupId: GROUP_IDS.hipertrofia.lower_main,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: null,
    restSeconds: 120,
  },
  {
    id: PROGRAM_EXERCISE_IDS.hipertrofia.rdl,
    sessionId: SESSION_IDS.hipertrofia.lower,
    exerciseId: EXERCISE_IDS.romanianDeadlift,
    orderIndex: 1,
    groupId: GROUP_IDS.hipertrofia.lower_main,
    orderWithinGroup: 1,
    setTypeLabel: null,
    notes: null,
    restSeconds: 120,
  },
  {
    id: PROGRAM_EXERCISE_IDS.hipertrofia.leg_curl,
    sessionId: SESSION_IDS.hipertrofia.lower,
    exerciseId: EXERCISE_IDS.legCurl,
    orderIndex: 2,
    groupId: GROUP_IDS.hipertrofia.lower_acc,
    orderWithinGroup: 0,
    setTypeLabel: null,
    notes: null,
    restSeconds: 60,
  },
]

/**
 * Helper to create prescription series data
 */
function createSeries(
  setsData: Array<{
    reps: number | null
    repsMax?: number | null
    isAmrap?: boolean
    intensityType?: PrescriptionSeriesData['intensityType']
    intensityValue?: number | null
    intensityUnit?: PrescriptionSeriesData['intensityUnit']
    tempo?: string | null
    restSeconds?: number | null
  }>,
): PrescriptionSeriesData[] {
  return setsData.map((set, index) => ({
    orderIndex: index,
    reps: set.reps,
    repsMax: set.repsMax ?? null,
    isAmrap: set.isAmrap ?? false,
    intensityType: set.intensityType ?? null,
    intensityValue: set.intensityValue ?? null,
    intensityUnit: set.intensityUnit ?? null,
    tempo: set.tempo ?? null,
    restSeconds: set.restSeconds ?? null,
  }))
}

/**
 * Prescriptions seed data
 * Links exercises to weeks with series data
 */
const prescriptionsData = [
  // Fuerza - Squat prescriptions for all weeks
  {
    id: 'rx-seed-squat-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.squat,
    weekId: WEEK_IDS.fuerza.week1,
    series: createSeries([
      { reps: 5, intensityType: 'percentage', intensityValue: 70, intensityUnit: '%' },
      { reps: 5, intensityType: 'percentage', intensityValue: 75, intensityUnit: '%' },
      { reps: 5, intensityType: 'percentage', intensityValue: 80, intensityUnit: '%' },
    ]),
  },
  {
    id: 'rx-seed-squat-w2',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.squat,
    weekId: WEEK_IDS.fuerza.week2,
    series: createSeries([
      { reps: 3, intensityType: 'percentage', intensityValue: 80, intensityUnit: '%' },
      { reps: 3, intensityType: 'percentage', intensityValue: 85, intensityUnit: '%' },
      { reps: 3, intensityType: 'percentage', intensityValue: 88, intensityUnit: '%' },
    ]),
  },
  {
    id: 'rx-seed-squat-w3',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.squat,
    weekId: WEEK_IDS.fuerza.week3,
    series: createSeries([
      { reps: 2, intensityType: 'percentage', intensityValue: 90, intensityUnit: '%' },
      { reps: 2, intensityType: 'percentage', intensityValue: 93, intensityUnit: '%' },
      { reps: 1, intensityType: 'percentage', intensityValue: 95, intensityUnit: '%' },
    ]),
  },
  {
    id: 'rx-seed-squat-w4',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.squat,
    weekId: WEEK_IDS.fuerza.week4,
    series: createSeries([
      { reps: 5, intensityType: 'percentage', intensityValue: 60, intensityUnit: '%' },
      { reps: 5, intensityType: 'percentage', intensityValue: 60, intensityUnit: '%' },
    ]),
  },
  // Fuerza - Leg Press
  {
    id: 'rx-seed-legpress-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.leg_press,
    weekId: WEEK_IDS.fuerza.week1,
    series: createSeries([
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Fuerza - Bench Press
  {
    id: 'rx-seed-bench-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.bench,
    weekId: WEEK_IDS.fuerza.week1,
    series: createSeries([
      { reps: 5, intensityType: 'percentage', intensityValue: 72, intensityUnit: '%' },
      { reps: 5, intensityType: 'percentage', intensityValue: 77, intensityUnit: '%' },
      { reps: 5, intensityType: 'percentage', intensityValue: 82, intensityUnit: '%' },
    ]),
  },
  {
    id: 'rx-seed-bench-w2',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.bench,
    weekId: WEEK_IDS.fuerza.week2,
    series: createSeries([
      { reps: 3, intensityType: 'percentage', intensityValue: 82, intensityUnit: '%' },
      { reps: 3, intensityType: 'percentage', intensityValue: 87, intensityUnit: '%' },
      { reps: 2, intensityType: 'percentage', intensityValue: 90, intensityUnit: '%' },
    ]),
  },
  // Fuerza - Incline Dumbbell
  {
    id: 'rx-seed-incline-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.incline_db,
    weekId: WEEK_IDS.fuerza.week1,
    series: createSeries([
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Fuerza - Tricep Pushdown
  {
    id: 'rx-seed-tricep-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.tricep_push,
    weekId: WEEK_IDS.fuerza.week1,
    series: createSeries([
      { reps: 12, repsMax: 15, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 12, repsMax: 15, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 12, repsMax: 15, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Fuerza - Deadlift
  {
    id: 'rx-seed-deadlift-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.deadlift,
    weekId: WEEK_IDS.fuerza.week1,
    series: createSeries([
      { reps: 5, intensityType: 'percentage', intensityValue: 68, intensityUnit: '%' },
      { reps: 5, intensityType: 'percentage', intensityValue: 73, intensityUnit: '%' },
      { reps: 5, intensityType: 'percentage', intensityValue: 78, intensityUnit: '%' },
    ]),
  },
  // Fuerza - Barbell Row
  {
    id: 'rx-seed-row-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.fuerza.row,
    weekId: WEEK_IDS.fuerza.week1,
    series: createSeries([
      { reps: 8, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 8, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 8, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Hipertrofia - Bench
  {
    id: 'rx-seed-hiper-bench-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.bench,
    weekId: WEEK_IDS.hipertrofia.week1,
    series: createSeries([
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe', tempo: '3010' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe', tempo: '3010' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe', tempo: '3010' },
    ]),
  },
  {
    id: 'rx-seed-hiper-bench-w2',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.bench,
    weekId: WEEK_IDS.hipertrofia.week2,
    series: createSeries([
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe', tempo: '3010' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe', tempo: '3010' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 9, intensityUnit: 'rpe', tempo: '3010' },
    ]),
  },
  // Hipertrofia - Shoulder Press
  {
    id: 'rx-seed-hiper-shoulder-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.shoulder_press,
    weekId: WEEK_IDS.hipertrofia.week1,
    series: createSeries([
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Hipertrofia - Lat Pulldown
  {
    id: 'rx-seed-hiper-lat-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.lat_pull,
    weekId: WEEK_IDS.hipertrofia.week1,
    series: createSeries([
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Hipertrofia - Seated Cable Row
  {
    id: 'rx-seed-hiper-row-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.cable_row,
    weekId: WEEK_IDS.hipertrofia.week1,
    series: createSeries([
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Hipertrofia - Squat
  {
    id: 'rx-seed-hiper-squat-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.squat,
    weekId: WEEK_IDS.hipertrofia.week1,
    series: createSeries([
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
      { reps: 8, repsMax: 10, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Hipertrofia - RDL
  {
    id: 'rx-seed-hiper-rdl-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.rdl,
    weekId: WEEK_IDS.hipertrofia.week1,
    series: createSeries([
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 10, repsMax: 12, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
    ]),
  },
  // Hipertrofia - Leg Curl
  {
    id: 'rx-seed-hiper-curl-w1',
    programExerciseId: PROGRAM_EXERCISE_IDS.hipertrofia.leg_curl,
    weekId: WEEK_IDS.hipertrofia.week1,
    series: createSeries([
      { reps: 12, repsMax: 15, intensityType: 'rpe', intensityValue: 7, intensityUnit: 'rpe' },
      { reps: 12, repsMax: 15, intensityType: 'rpe', intensityValue: 8, intensityUnit: 'rpe' },
      { reps: null, isAmrap: true, intensityType: 'rpe', intensityValue: 9, intensityUnit: 'rpe' },
    ]),
  },
]

/**
 * Workout logs seed data
 * Some completed logs for history testing
 */
const workoutLogsData = [
  {
    id: LOG_IDS.carlos_d1_w1,
    organizationId: SEED_ORG_ID,
    athleteId: ATHLETE_IDS.carlos,
    programId: PROGRAM_IDS.fuerza,
    sessionId: SESSION_IDS.fuerza.day1,
    weekId: WEEK_IDS.fuerza.week1,
    logDate: new Date('2024-01-15T10:30:00Z'),
    status: 'completed' as const,
    sessionRpe: 8,
    sessionNotes: 'Buen día, se sintió fuerte. Ligera molestia en rodilla izquierda al final.',
  },
  {
    id: LOG_IDS.carlos_d2_w1,
    organizationId: SEED_ORG_ID,
    athleteId: ATHLETE_IDS.carlos,
    programId: PROGRAM_IDS.fuerza,
    sessionId: SESSION_IDS.fuerza.day2,
    weekId: WEEK_IDS.fuerza.week1,
    logDate: new Date('2024-01-17T11:00:00Z'),
    status: 'completed' as const,
    sessionRpe: 7,
    sessionNotes: null,
  },
  {
    id: LOG_IDS.maria_upper_w1,
    organizationId: SEED_ORG_ID,
    athleteId: ATHLETE_IDS.maria,
    programId: PROGRAM_IDS.hipertrofia,
    sessionId: SESSION_IDS.hipertrofia.upper,
    weekId: WEEK_IDS.hipertrofia.week1,
    logDate: new Date('2024-01-16T18:00:00Z'),
    status: 'completed' as const,
    sessionRpe: 7,
    sessionNotes: 'Bomba increíble en los brazos.',
  },
]

/**
 * Helper to create logged series data
 */
function createLoggedSeries(
  setsData: Array<{
    repsPerformed: number | null
    weightUsed: number | null
    rpe?: number | null
    skipped?: boolean
    prescribedReps?: number | null
    prescribedWeight?: number | null
  }>,
): LoggedSeriesData[] {
  return setsData.map((set, index) => ({
    orderIndex: index,
    repsPerformed: set.repsPerformed,
    weightUsed: set.weightUsed,
    rpe: set.rpe ?? null,
    skipped: set.skipped ?? false,
    prescribedReps: set.prescribedReps ?? null,
    prescribedWeight: set.prescribedWeight ?? null,
  }))
}

/**
 * Logged exercises seed data
 */
const loggedExercisesData = [
  // Carlos - Day 1 - Squat
  {
    id: LOGGED_EXERCISE_IDS.carlos_squat,
    logId: LOG_IDS.carlos_d1_w1,
    exerciseId: EXERCISE_IDS.backSquat,
    groupItemId: PROGRAM_EXERCISE_IDS.fuerza.squat,
    orderIndex: 0,
    notes: null,
    skipped: false,
    series: createLoggedSeries([
      { repsPerformed: 5, weightUsed: 140, rpe: 6, prescribedReps: 5, prescribedWeight: 140 },
      { repsPerformed: 5, weightUsed: 150, rpe: 7, prescribedReps: 5, prescribedWeight: 150 },
      { repsPerformed: 5, weightUsed: 160, rpe: 8, prescribedReps: 5, prescribedWeight: 160 },
    ]),
  },
  // Carlos - Day 1 - Leg Press
  {
    id: LOGGED_EXERCISE_IDS.carlos_leg_press,
    logId: LOG_IDS.carlos_d1_w1,
    exerciseId: EXERCISE_IDS.legPress,
    groupItemId: PROGRAM_EXERCISE_IDS.fuerza.leg_press,
    orderIndex: 1,
    notes: null,
    skipped: false,
    series: createLoggedSeries([
      { repsPerformed: 12, weightUsed: 200, rpe: 7, prescribedReps: 10, prescribedWeight: null },
      { repsPerformed: 11, weightUsed: 200, rpe: 7, prescribedReps: 10, prescribedWeight: null },
      { repsPerformed: 10, weightUsed: 200, rpe: 8, prescribedReps: 10, prescribedWeight: null },
    ]),
  },
  // Carlos - Day 2 - Bench
  {
    id: LOGGED_EXERCISE_IDS.carlos_bench,
    logId: LOG_IDS.carlos_d2_w1,
    exerciseId: EXERCISE_IDS.benchPress,
    groupItemId: PROGRAM_EXERCISE_IDS.fuerza.bench,
    orderIndex: 0,
    notes: null,
    skipped: false,
    series: createLoggedSeries([
      { repsPerformed: 5, weightUsed: 90, rpe: 6, prescribedReps: 5, prescribedWeight: 90 },
      { repsPerformed: 5, weightUsed: 96, rpe: 7, prescribedReps: 5, prescribedWeight: 96 },
      { repsPerformed: 5, weightUsed: 102, rpe: 8, prescribedReps: 5, prescribedWeight: 102 },
    ]),
  },
  // María - Upper - Bench
  {
    id: LOGGED_EXERCISE_IDS.maria_bench,
    logId: LOG_IDS.maria_upper_w1,
    exerciseId: EXERCISE_IDS.benchPress,
    groupItemId: PROGRAM_EXERCISE_IDS.hipertrofia.bench,
    orderIndex: 0,
    notes: null,
    skipped: false,
    series: createLoggedSeries([
      { repsPerformed: 10, weightUsed: 35, rpe: 7, prescribedReps: 8, prescribedWeight: null },
      { repsPerformed: 9, weightUsed: 35, rpe: 8, prescribedReps: 8, prescribedWeight: null },
      { repsPerformed: 8, weightUsed: 35, rpe: 8, prescribedReps: 8, prescribedWeight: null },
    ]),
  },
  // María - Upper - Shoulder Press
  {
    id: LOGGED_EXERCISE_IDS.maria_shoulder,
    logId: LOG_IDS.maria_upper_w1,
    exerciseId: EXERCISE_IDS.shoulderPress,
    groupItemId: PROGRAM_EXERCISE_IDS.hipertrofia.shoulder_press,
    orderIndex: 1,
    notes: null,
    skipped: false,
    series: createLoggedSeries([
      { repsPerformed: 12, weightUsed: 12, rpe: 7, prescribedReps: 10, prescribedWeight: null },
      { repsPerformed: 11, weightUsed: 12, rpe: 7, prescribedReps: 10, prescribedWeight: null },
      { repsPerformed: 10, weightUsed: 12, rpe: 8, prescribedReps: 10, prescribedWeight: null },
    ]),
  },
]

/**
 * Seeds athletes and programs for testing workout logging feature
 *
 * IMPORTANT: Requires an existing organization with ID 'org-seed-test-001'
 * In development, this organization should be created via the auth flow first.
 */
export async function seedAthletesAndPrograms(db: DbClient): Promise<void> {
  console.log('Seeding athletes and programs...')

  // Delete existing seed data (in reverse order of dependencies)
  await db.delete(loggedExercises)
  await db.delete(workoutLogs)
  await db.delete(prescriptions)
  await db.delete(programExercises)
  await db.delete(exerciseGroups)
  await db.delete(programSessions)
  await db.delete(programWeeks)
  await db.delete(programs)
  await db.delete(athletes)

  // Insert athletes
  await db.insert(athletes).values(athletesData).onConflictDoNothing({ target: athletes.id })
  console.log(`  Seeded ${athletesData.length} athletes`)

  // Insert programs
  await db.insert(programs).values(programsData).onConflictDoNothing({ target: programs.id })
  console.log(`  Seeded ${programsData.length} programs`)

  // Insert weeks
  await db.insert(programWeeks).values(weeksData).onConflictDoNothing({ target: programWeeks.id })
  console.log(`  Seeded ${weeksData.length} program weeks`)

  // Insert sessions
  await db.insert(programSessions).values(sessionsData).onConflictDoNothing({ target: programSessions.id })
  console.log(`  Seeded ${sessionsData.length} program sessions`)

  // Insert exercise groups
  await db.insert(exerciseGroups).values(exerciseGroupsData).onConflictDoNothing({ target: exerciseGroups.id })
  console.log(`  Seeded ${exerciseGroupsData.length} exercise groups`)

  // Insert program exercises
  await db.insert(programExercises).values(programExercisesData).onConflictDoNothing({ target: programExercises.id })
  console.log(`  Seeded ${programExercisesData.length} program exercises`)

  // Insert prescriptions
  await db.insert(prescriptions).values(prescriptionsData).onConflictDoNothing({ target: prescriptions.id })
  console.log(`  Seeded ${prescriptionsData.length} prescriptions`)

  // Insert workout logs
  await db.insert(workoutLogs).values(workoutLogsData).onConflictDoNothing({ target: workoutLogs.id })
  console.log(`  Seeded ${workoutLogsData.length} workout logs`)

  // Insert logged exercises
  await db.insert(loggedExercises).values(loggedExercisesData).onConflictDoNothing({ target: loggedExercises.id })
  console.log(`  Seeded ${loggedExercisesData.length} logged exercises`)

  console.log('Athletes and programs seed complete!')
}

/**
 * Export the organization ID for reference in other seeds or tests
 */
export const SEED_ORGANIZATION_ID = SEED_ORG_ID
