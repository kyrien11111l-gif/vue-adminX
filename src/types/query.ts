export type QueryStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type QueryCategory = 'data-sync' | 'report' | 'access-review'
export type QueryPriority = 'high' | 'medium' | 'low'
export type QuerySource = 'portal' | 'api' | 'schedule' | 'import'

export interface QueryFilters {
  keyword?: string
  category?: QueryCategory | 'all'
  status?: QueryStatus | 'all'
  orderNo?: string
  requestId?: string
  description?: string
  remark?: string
  applicant?: string
  department?: string
  processor?: string
  title?: string
  startDate?: string
  endDate?: string
  priority?: QueryPriority | 'all'
  pageSize?: number
  pageCurrent?: number
}

export interface QueryRow {
  id: number
  orderNo: string
  title: string
  requestId: string
  description: string
  remark: string
  category: QueryCategory
  applicant: string
  status: QueryStatus
  updatedAt: string
  department: string
  priority: QueryPriority
  processor: string
  source: QuerySource
  duration: string
}

export interface QueryResult {
  items: QueryRow[]
  total: number
}
