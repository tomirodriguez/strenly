import type { ListTemplatesQuery } from '@strenly/contracts/programs/template'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/api-client'

/**
 * Hook to fetch a list of templates.
 * @param input - Filter and pagination parameters
 * @returns Query result with templates list and total count
 */
export function useTemplates(input?: ListTemplatesQuery) {
  return useQuery(orpc.programs.templates.list.queryOptions({ input: input ?? {} }))
}
