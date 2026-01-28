/**
 * Athlete Detail Route
 *
 * Shows athlete information and their assigned program.
 * URL: /$orgSlug/athletes/:athleteId
 */

import { createFileRoute } from '@tanstack/react-router'
import { AthleteDetailView } from '@/features/athletes/views/athlete-detail-view'

export const Route = createFileRoute('/_authenticated/$orgSlug/athletes/$athleteId/')({
  component: AthleteDetailPage,
})

function AthleteDetailPage() {
  const { athleteId } = Route.useParams()
  return <AthleteDetailView athleteId={athleteId} />
}
