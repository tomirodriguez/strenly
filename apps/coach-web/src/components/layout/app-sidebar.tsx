import { Link, useMatchRoute, useParams } from '@tanstack/react-router'
import { DumbbellIcon, HomeIcon, UsersIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  {
    path: 'dashboard',
    label: 'Panel',
    icon: HomeIcon,
  },
  {
    path: 'athletes',
    label: 'Atletas',
    icon: UsersIcon,
  },
  {
    path: 'exercises',
    label: 'Ejercicios',
    icon: DumbbellIcon,
  },
]

export function AppSidebar() {
  const matchRoute = useMatchRoute()
  const params = useParams({ strict: false })
  const orgSlug = (params as { orgSlug?: string }).orgSlug ?? ''

  return (
    <Sidebar collapsible="offExamples">
      <SidebarHeader className="border-sidebar-border border-b">
        <div className="flex h-12 items-center px-4">
          <span className="font-bold text-lg">Treino</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const to = `/${orgSlug}/${item.path}`
                const isActive = matchRoute({ to, fuzzy: true })
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      render={
                        <Link
                          to={to}
                          className="[&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"
                        />
                      }
                      isActive={Boolean(isActive)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
