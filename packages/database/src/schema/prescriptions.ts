import { relations } from 'drizzle-orm'
import { index, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { programExercises } from './program-exercises'
import { programWeeks } from './program-weeks'

/**
 * Single set/series in a prescription array
 * Each element represents one set with its parameters
 *
 * @example
 * [
 *   { orderIndex: 0, reps: 5, repsMax: null, isAmrap: false, intensityType: 'percentage', intensityValue: 80, intensityUnit: '%', tempo: null, restSeconds: null },
 *   { orderIndex: 1, reps: 5, repsMax: null, isAmrap: false, intensityType: 'percentage', intensityValue: 85, intensityUnit: '%', tempo: null, restSeconds: null },
 *   { orderIndex: 2, reps: null, repsMax: null, isAmrap: true, intensityType: 'percentage', intensityValue: 90, intensityUnit: '%', tempo: null, restSeconds: null }
 * ]
 */
export interface PrescriptionSeriesData {
  orderIndex: number // Position in array: 0, 1, 2...
  reps: number | null // null for AMRAP
  repsMax: number | null // For rep ranges (8-12)
  isAmrap: boolean
  intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  intensityValue: number | null
  intensityUnit: 'kg' | 'lb' | '%' | 'rpe' | 'rir' | null
  tempo: string | null // "3110" or "31X0"
  restSeconds: number | null // For intra-set rest (clusters)
}

/**
 * Prescriptions table
 * Cell values in the program grid - one prescription per exercise per week
 * Stores structured prescription data as JSONB series array
 */
export const prescriptions = pgTable(
  'prescriptions',
  {
    id: text('id').primaryKey(), // prefixed 'rx-'
    programExerciseId: text('program_exercise_id')
      .notNull()
      .references(() => programExercises.id, { onDelete: 'cascade' }),
    weekId: text('week_id')
      .notNull()
      .references(() => programWeeks.id, { onDelete: 'cascade' }),
    // Series array structure - each element represents one set with its parameters
    series: jsonb('series').$type<PrescriptionSeriesData[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique('prescriptions_exercise_week_unique').on(table.programExerciseId, table.weekId),
    index('prescriptions_program_exercise_id_idx').on(table.programExerciseId),
    index('prescriptions_week_id_idx').on(table.weekId),
  ],
)

/**
 * Prescriptions relations
 */
export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  programExercise: one(programExercises, {
    fields: [prescriptions.programExerciseId],
    references: [programExercises.id],
  }),
  week: one(programWeeks, {
    fields: [prescriptions.weekId],
    references: [programWeeks.id],
  }),
}))
