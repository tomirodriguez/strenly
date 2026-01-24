import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
import { AuthProvider } from '@/contexts/auth-context'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const sessionData = await authClient.getSession()
    if (!sessionData.data) {
      throw redirect({
        to: '/login',
      })
    }
    return { authData: sessionData.data }
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
