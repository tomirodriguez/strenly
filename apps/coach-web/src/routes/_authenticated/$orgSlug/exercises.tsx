import { createFileRoute } from '@tanstack/react-router'
import { ExercisesBrowserView } from '@/features/exercises/views/exercises-browser-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/exercises')({
  component: ExercisesBrowserView,
})
