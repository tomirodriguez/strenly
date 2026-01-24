import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { setCurrentOrgSlug } from '@/lib/api-client'
import { authClient, useActiveOrganization } from '@/lib/auth-client'

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
  const { data: activeOrg } = useActiveOrganization()

  // Sync active organization with API client
  // This ensures all API calls include the X-Organization-Slug header
  useEffect(() => {
    setCurrentOrgSlug(activeOrg?.slug ?? null)
  }, [activeOrg?.slug])

  return (
    <AppShell authData={authData}>
      <Outlet />
    </AppShell>
  )
}
