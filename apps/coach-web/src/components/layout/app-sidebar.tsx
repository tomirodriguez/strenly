import { Link, useMatchRoute } from '@tanstack/react-router'
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
    to: '/dashboard',
    label: 'Panel',
    icon: HomeIcon,
  },
  {
    to: '/athletes',
    label: 'Atletas',
    icon: UsersIcon,
  },
  {
    to: '/exercises',
    label: 'Ejercicios',
    icon: DumbbellIcon,
  },
]

export function AppSidebar() {
  const matchRoute = useMatchRoute()

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
                const isActive = matchRoute({ to: item.to })
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      render={
                        <Link
                          to={item.to}
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
