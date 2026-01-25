/**
 * Schema Export Index
 *
 * EXCEPTION: This barrel file is allowed per architecture.md
 * as it aggregates database schema for Drizzle Kit and Better-Auth adapter.
 */

export * from './athlete-invitations'
// Athletes and invitations
export * from './athletes'
// Better-Auth schemas (users, sessions, accounts, organizations, members, invitations)
export * from './auth'
export * from './exercise-muscles'
export * from './exercise-progressions'
export * from './exercises'
// Exercise library
export * from './muscle-groups'
// Subscription plans
export * from './plans'
// Program builder
export * from './prescriptions'
export * from './program-exercises'
export * from './program-sessions'
export * from './program-weeks'
export * from './programs'
// Organization subscriptions
export * from './subscriptions'
