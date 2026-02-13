import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { type AuthContextValue, AuthProvider } from '@/contexts/auth-context'
import type { OrganizationContextValue } from '@/contexts/organization-context'
import { authClient } from '@/lib/auth-client'

/**
 * Cache for auth data to avoid redundant API calls on navigation.
 * Session + organizations fetched once, then cached for 30 seconds.
 */
type AuthCache = {
  session: AuthContextValue
  organizations: OrganizationContextValue[]
  timestamp: number
}

let authCache: AuthCache | null = null
const CACHE_TTL = 30000 // 30 seconds

function getCachedAuth(): AuthCache | null {
  if (authCache && Date.now() - authCache.timestamp < CACHE_TTL) {
    return authCache
  }
  return null
}

/**
 * Clear auth cache on logout or when session needs refresh.
 */
export function clearAuthCache(): void {
  authCache = null
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    // Use cached auth if available and fresh
    const cached = getCachedAuth()
    if (cached) {
      return { authData: cached.session, organizations: cached.organizations }
    }

    // Fetch session and organizations
    const sessionData = await authClient.getSession()
    if (!sessionData.data) {
      throw redirect({ to: '/login' })
    }

    const orgsResult = await authClient.organization.list()
    const organizations = (orgsResult.data ?? []).map((org) => {
      const rawMeta = org.metadata
      const metadata: OrganizationContextValue['metadata'] =
        rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
          ? {
              type: 'type' in rawMeta && typeof rawMeta.type === 'string' ? rawMeta.type : undefined,
              status: 'status' in rawMeta && typeof rawMeta.status === 'string' ? rawMeta.status : undefined,
            }
          : null

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        metadata,
      }
    })

    // Cache the auth data
    authCache = {
      session: sessionData.data,
      organizations,
      timestamp: Date.now(),
    }

    return { authData: sessionData.data, organizations }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { authData } = Route.useRouteContext()

  return (
    <AuthProvider value={authData}>
      <AppShell authData={authData}>
        <Outlet />
      </AppShell>
    </AuthProvider>
  )
}
