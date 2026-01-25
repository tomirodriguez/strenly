import { relations } from 'drizzle-orm'
import { index, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { programExercises } from './program-exercises'
import { programWeeks } from './program-weeks'

/**
 * Parsed prescription structure stored as JSONB
 * Represents structured data parsed from notation like "3x8@120kg (3110)"
 *
 * @example
 * {
 *   sets: 3,
 *   repsMin: 8,
 *   repsMax: null,
 *   isAmrap: false,
 *   isUnilateral: false,
 *   unilateralUnit: null,
 *   intensityType: 'absolute',
 *   intensityValue: 120,
 *   intensityUnit: 'kg',
 *   tempo: '3110'
 * }
 */
export interface ParsedPrescription {
  sets: number
  repsMin: number
  repsMax: number | null // For rep ranges (8-12)
  isAmrap: boolean
  isUnilateral: boolean // true for "3x12/leg"
  unilateralUnit: 'leg' | 'arm' | 'side' | null
  intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  intensityValue: number | null
  intensityUnit: 'kg' | 'lb' | '%' | 'rpe' | 'rir' | null
  tempo: string | null // "3110" or "31X0" format (4-char ECCC, X = explosive)
}

/**
 * Prescriptions table
 * Cell values in the program grid - one prescription per exercise per week
 * Stores structured prescription data as JSONB
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
    prescription: jsonb('prescription').$type<ParsedPrescription>().notNull(),
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
