import type { ResultAsync } from 'neverthrow'

export type RepositoryError = {
  type: 'DATABASE_ERROR'
  message: string
  cause?: unknown
}

export const repositoryError = (message: string, cause: unknown): RepositoryError => ({
  type: 'DATABASE_ERROR',
  message,
  cause,
})

export type PaginationOptions = {
  limit: number
  offset: number
}

export type PaginatedResult<T> = {
  items: T[]
  totalCount: number
}

export type RepositoryResult<T> = ResultAsync<T, RepositoryError>
