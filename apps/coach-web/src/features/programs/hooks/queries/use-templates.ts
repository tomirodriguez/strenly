import type { ListTemplatesInput } from '@strenly/contracts/programs'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a list of templates.
 * @param input - Filter and pagination parameters
 * @returns Query result with templates list and total count
 */
export function useTemplates(input?: ListTemplatesInput) {
  return useQuery(orpc.programs.templates.list.queryOptions({ input: input ?? {} }))
}
