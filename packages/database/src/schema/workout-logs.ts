import { relations } from 'drizzle-orm'
import { index, integer, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { athletes } from './athletes'
import { organizations } from './auth'
import { programs } from './programs'

/**
 * Log status enum
 * - completed: Athlete finished all planned exercises
 * - partial: Some exercises done, some skipped or incomplete
 * - skipped: Entire workout skipped
 */
export const logStatusEnum = pgEnum('log_status', ['completed', 'partial', 'skipped'])

/**
 * Workout Logs table
 * Tracks what athletes actually performed versus what was prescribed.
 * One log per athlete per session per week (unique constraint).
 */
export const workoutLogs = pgTable(
  'workout_logs',
  {
    id: text('id').primaryKey(), // prefixed 'log-'
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    athleteId: text('athlete_id')
      .notNull()
      .references(() => athletes.id, { onDelete: 'cascade' }),
    programId: text('program_id')
      .notNull()
      .references(() => programs.id, { onDelete: 'cascade' }),
    sessionId: text('session_id').notNull(), // Reference to program session (not FK, program structure may change)
    weekId: text('week_id').notNull(), // Reference to program week (not FK)
    logDate: timestamp('log_date').notNull(), // When the workout occurred (user-editable)
    status: logStatusEnum('status').default('partial').notNull(),
    sessionRpe: integer('session_rpe'), // 1-10 scale, nullable
    sessionNotes: text('session_notes'), // Nullable
    // Display context (denormalized snapshots)
    programName: text('program_name'),
    weekName: text('week_name'),
    sessionName: text('session_name'),
    athleteName: text('athlete_name'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('workout_logs_organization_id_idx').on(table.organizationId),
    index('workout_logs_athlete_id_idx').on(table.athleteId),
    index('workout_logs_program_id_idx').on(table.programId),
    // One log per athlete per session per week
    unique('workout_logs_athlete_session_week_unique').on(table.athleteId, table.sessionId, table.weekId),
  ],
)

/**
 * Workout Logs relations
 */
export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [workoutLogs.organizationId],
    references: [organizations.id],
  }),
  athlete: one(athletes, {
    fields: [workoutLogs.athleteId],
    references: [athletes.id],
  }),
  program: one(programs, {
    fields: [workoutLogs.programId],
    references: [programs.id],
  }),
}))
