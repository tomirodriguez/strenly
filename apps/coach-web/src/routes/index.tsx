import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const sessionData = await authClient.getSession()

    // Redirect to dashboard if authenticated, otherwise to login
    if (sessionData.data) {
      throw redirect({ to: '/dashboard' })
    } else {
      throw redirect({ to: '/login' })
    }
  },
})
