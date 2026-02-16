import { useLocation } from '@tanstack/react-router'
import { useOptionalOrganization } from '@/contexts/organization-context'

/**
 * Returns the current organization slug.
 *
 * Tries OrganizationContext first (available within $orgSlug routes).
 * Falls back to extracting the slug from the URL path for components
 * that render above the OrganizationProvider (e.g., sidebar in _authenticated layout).
 */
export function useOrgSlug(): string {
  const org = useOptionalOrganization()
  const location = useLocation()

  if (org) return org.slug

  // Fallback: extract from URL path (/{orgSlug}/...)
  const firstSegment = location.pathname.split('/')[1]
  if (!firstSegment) {
    throw new Error('useOrgSlug must be used within an org-scoped route (/$orgSlug/...)')
  }
  return firstSegment
}
