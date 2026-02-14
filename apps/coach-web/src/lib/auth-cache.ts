import type { AuthContextValue } from '@/contexts/auth-context'
import type { OrganizationContextValue } from '@/contexts/organization-context'

type AuthCache = {
  session: AuthContextValue
  organizations: OrganizationContextValue[]
  timestamp: number
}

let authCache: AuthCache | null = null
const CACHE_TTL = 30000 // 30 seconds

export function getCachedAuth(): AuthCache | null {
  if (authCache && Date.now() - authCache.timestamp < CACHE_TTL) {
    return authCache
  }
  return null
}

export function setCachedAuth(session: AuthContextValue, organizations: OrganizationContextValue[]): void {
  authCache = { session, organizations, timestamp: Date.now() }
}

export function clearAuthCache(): void {
  authCache = null
}
