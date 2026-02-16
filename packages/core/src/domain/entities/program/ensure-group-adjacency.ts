/**
 * Ensures exercise groups are adjacent in the row order.
 * If a group is split, consolidates all members after the first occurrence.
 *
 * This enforces the domain invariant that exercises in the same group
 * must be contiguous in the ordering.
 */
export function ensureGroupAdjacency(rowIds: string[], rowMetadata: Map<string, { groupId: string | null }>): string[] {
  // Track which rows we've placed
  const placed = new Set<string>()
  const result: string[] = []

  for (const rowId of rowIds) {
    if (placed.has(rowId)) continue

    const metadata = rowMetadata.get(rowId)
    const groupId = metadata?.groupId

    if (groupId) {
      // Find all rows in this group and place them together
      const groupMembers = rowIds.filter((id) => {
        const m = rowMetadata.get(id)
        return m?.groupId === groupId && !placed.has(id)
      })
      for (const member of groupMembers) {
        result.push(member)
        placed.add(member)
      }
    } else {
      // Standalone row
      result.push(rowId)
      placed.add(rowId)
    }
  }

  return result
}
