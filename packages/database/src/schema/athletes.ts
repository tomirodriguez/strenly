import { date, index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { organizations, users } from './auth'

/**
 * Athlete gender enum
 */
export const athleteGenderEnum = pgEnum('athlete_gender', ['male', 'female', 'other'])

/**
 * Athlete status enum
 */
export const athleteStatusEnum = pgEnum('athlete_status', ['active', 'inactive'])

/**
 * Athletes table
 * Represents athletes managed by an organization (gym or coach)
 * Athletes may optionally be linked to a user account for self-service access
 */
export const athletes = pgTable(
  'athletes',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email'),
    phone: text('phone'),
    birthdate: date('birthdate'),
    gender: athleteGenderEnum('gender'),
    notes: text('notes'),
    status: athleteStatusEnum('status').default('active').notNull(),
    linkedUserId: text('linked_user_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('athletes_organization_id_idx').on(table.organizationId),
    index('athletes_linked_user_id_idx').on(table.linkedUserId),
    index('athletes_status_idx').on(table.status),
  ],
)
