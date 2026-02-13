import { useOrganization } from '@/contexts/organization-context'

/**
 * Returns the current organization slug from OrganizationContext.
 * Must be used within a route that is a descendant of `/$orgSlug` (OrganizationProvider).
 *
 * Eliminates the need for `(params as { orgSlug?: string }).orgSlug` casts
 * across components that need the org slug for navigation.
 */
export function useOrgSlug(): string {
  const org = useOrganization()
  return org.slug
}
