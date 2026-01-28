import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/$orgSlug/athletes')({
  component: AthletesLayout,
})

function AthletesLayout() {
  return <Outlet />
}
