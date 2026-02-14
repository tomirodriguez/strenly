import type { OrganizationType } from '@strenly/contracts/subscriptions/plan'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

export function usePlans(organizationType?: OrganizationType) {
  return useQuery(
    orpc.subscriptions.listPlans.queryOptions({
      input: { organizationType },
    }),
  )
}
