/**
 * Schema Export Index
 *
 * EXCEPTION: This barrel file is allowed per architecture.md
 * as it aggregates database schema for Drizzle Kit and Better-Auth adapter.
 */

// Better-Auth schemas (users, sessions, accounts, organizations, members, invitations)
export * from './auth'

// Subscription plans
export * from './plans'

// Organization subscriptions
export * from './subscriptions'
