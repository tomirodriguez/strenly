import { AppHeader } from './app-header'
import { AppSidebar } from './app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

type AppShellProps = {
  children: React.ReactNode
  authData: {
    user: {
      id: string
      name: string
      email: string
    }
    session: {
      id: string
    }
  }
  primaryAction?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }
}

export function AppShell({ children, authData, primaryAction }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={authData.user} />
      <SidebarInset>
        <AppHeader primaryAction={primaryAction} />
        <main className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
