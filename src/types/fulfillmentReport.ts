export interface FulfillmentReportDetail {
  groupId: string
  operator: string
  country: string
  date: string
  shippedCount: number
  oversoldCount: number
  destinationRejectCount: number
  clearanceCount: number
  fulfillmentExceptionCount: number
  signedCount: number
  controllableTimeliness: number | null
  destinationRejectTimeliness: number | null
  clearanceTimeliness: number | null
  fulfillmentTimeliness: number | null
  totalSignTimeliness: number | null
}

export interface FulfillmentReportRow extends FulfillmentReportDetail {
  id: number
  isSubtotal: boolean
  signRate: number
}

export interface FulfillmentReportFilters {
  operator?: string
  country?: string
  dateRange?: string[]
  pageSize?: number
  pageCurrent?: number
}

export interface FulfillmentReportResult {
  items: FulfillmentReportRow[]
  total: number
}
