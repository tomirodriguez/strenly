import { Link, useMatches } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  athletes: 'Athletes',
  exercises: 'Exercises',
  settings: 'Settings',
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function Breadcrumbs() {
  const matches = useMatches()

  const breadcrumbs = matches
    .filter((match) => match.pathname !== '/')
    .map((match) => {
      const segments = match.pathname.split('/').filter(Boolean)
      const lastSegment = segments[segments.length - 1]

      const label = routeLabels[lastSegment] ?? capitalizeFirst(lastSegment ?? '')

      return {
        pathname: match.pathname,
        label,
      }
    })
    .filter((item) => item.label && item.label !== '_authenticated' && item.label !== '_auth')

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <div key={item.pathname} className="flex items-center gap-2">
              {index > 0 && (
                <BreadcrumbSeparator>
                  <ChevronRightIcon className="size-4" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={item.pathname} />}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
