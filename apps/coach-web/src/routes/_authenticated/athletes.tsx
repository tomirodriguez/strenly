import { createFileRoute } from '@tanstack/react-router'
import { AthletesListView } from '@/features/athletes/views/athletes-list-view'

export const Route = createFileRoute('/_authenticated/athletes')({
  component: AthletesListView,
})
