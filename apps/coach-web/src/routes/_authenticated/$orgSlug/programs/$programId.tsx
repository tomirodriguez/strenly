import { createFileRoute } from '@tanstack/react-router'
import { ProgramEditorView } from '@/features/programs/views/program-editor-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/programs/$programId')({
  component: ProgramEditorPage,
})

function ProgramEditorPage() {
  const { orgSlug, programId } = Route.useParams()
  return <ProgramEditorView orgSlug={orgSlug} programId={programId} />
}
