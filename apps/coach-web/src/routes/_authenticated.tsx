import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/app-shell'
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
    <AppShell authData={authData}>
      <Outlet />
    </AppShell>
  )
}
