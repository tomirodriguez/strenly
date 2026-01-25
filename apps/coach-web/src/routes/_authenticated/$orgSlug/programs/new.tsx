import { createFileRoute } from '@tanstack/react-router'
import { NewProgramView } from '@/features/programs/views/new-program-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/programs/new')({
  component: NewProgramView,
})
