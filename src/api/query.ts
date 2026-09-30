import type { QueryFilters, QueryResult } from '@/types'
import { request } from '@/utils/http'

export function queryData(
  filters: QueryFilters = {},
  signal?: AbortSignal
): Promise<QueryResult> {
  return request.post<QueryResult, QueryFilters>('/query', {
    data: filters,
    signal
  })
}
