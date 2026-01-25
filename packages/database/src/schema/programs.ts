import { relations } from 'drizzle-orm'
import { boolean, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { athletes } from './athletes'
import { organizations } from './auth'

/**
 * Program status enum
 * - draft: Program is being created/edited
 * - active: Program is assigned and in use
 * - archived: Program is no longer active
 */
export const programStatusEnum = pgEnum('program_status', ['draft', 'active', 'archived'])

/**
 * Programs table
 * Stores training programs that can be assigned to athletes or saved as templates
 * - athleteId null + isTemplate true = reusable template
 * - athleteId set + isTemplate false = athlete-specific program
 */
export const programs = pgTable(
  'programs',
  {
    id: text('id').primaryKey(), // prefixed 'prg-'
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    athleteId: text('athlete_id').references(() => athletes.id, { onDelete: 'set null' }),
    isTemplate: boolean('is_template').default(false).notNull(),
    status: programStatusEnum('status').default('draft').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('programs_organization_id_idx').on(table.organizationId),
    index('programs_athlete_id_idx').on(table.athleteId),
    index('programs_is_template_idx').on(table.isTemplate),
    index('programs_status_idx').on(table.status),
  ],
)

/**
 * Programs relations
 */
export const programsRelations = relations(programs, ({ one }) => ({
  organization: one(organizations, {
    fields: [programs.organizationId],
    references: [organizations.id],
  }),
  athlete: one(athletes, {
    fields: [programs.athleteId],
    references: [athletes.id],
  }),
}))
