import { createFileRoute } from '@tanstack/react-router'
import { ProgramsListView } from '@/features/programs/views/programs-list-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/programs/')({
  component: ProgramsListView,
})
