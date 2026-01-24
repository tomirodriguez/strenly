import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'

export interface DashboardStats {
  totalAthletes: number
  activeAthletes: number
  pendingInvitations: number
}

/**
 * Hook to fetch dashboard statistics.
 * Combines multiple athlete queries to compute stats.
 *
 * @returns Dashboard stats and loading state
 */
export function useDashboardStats() {
  // Fetch total athletes count
  const { data: allAthletesData, isLoading: isLoadingAll } = useAthletes({ limit: 1 })

  // Fetch active athletes count
  const { data: activeAthletesData, isLoading: isLoadingActive } = useAthletes({
    status: 'active',
    limit: 1,
  })

  // Fetch all athletes to calculate pending invitations (those without linked user accounts)
  // Note: This could be optimized with a dedicated backend query in the future
  const { data: allAthletesForInvites, isLoading: isLoadingInvites } = useAthletes({
    limit: 100, // Fetch enough to calculate pending invitations accurately
  })

  // Calculate pending invitations: athletes without linked user accounts
  const pendingInvitations = allAthletesForInvites?.items.filter((a) => !a.isLinked).length ?? 0

  // Compute stats from query results
  const stats: DashboardStats = {
    totalAthletes: allAthletesData?.totalCount ?? 0,
    activeAthletes: activeAthletesData?.totalCount ?? 0,
    pendingInvitations,
  }

  return {
    stats,
    isLoading: isLoadingAll || isLoadingActive || isLoadingInvites,
  }
}
