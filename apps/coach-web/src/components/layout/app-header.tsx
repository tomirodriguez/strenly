import { BellIcon, SearchIcon } from 'lucide-react'
import { Breadcrumbs } from './breadcrumbs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type AppHeaderProps = {
  primaryAction?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }
}

export function AppHeader({ primaryAction }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-border border-b bg-background/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <SearchIcon className="size-5" />
          <span className="sr-only">Buscar</span>
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <BellIcon className="size-5" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {primaryAction && (
          <>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button onClick={primaryAction.onClick}>
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
