import { AppSidebar } from './app-sidebar'
import { Breadcrumbs } from './breadcrumbs'
import { UserMenu } from './user-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

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
}

export function AppShell({ children, authData }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-border border-b px-4">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumbs />
          </div>
          <UserMenu user={authData.user} />
        </header>
        <main className="flex flex-1 flex-col p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
