import { createContext, useContext, type ReactNode } from 'react'

/**
 * Auth context value type.
 * Matches the shape returned by authClient.getSession().
 */
export type AuthContextValue = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  session: {
    id: string
    expiresAt: Date
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  value: AuthContextValue
  children: ReactNode
}

/**
 * Provider component for auth context.
 * Caches session data fetched in beforeLoad to avoid redundant API calls.
 */
export function AuthProvider({ value, children }: AuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context.
 * Throws if used outside AuthProvider to ensure type safety.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
