import type { FulfillmentReportFilters, FulfillmentReportResult } from '@/types'
import { request } from '@/services'

export function queryFulfillmentReport(
  filters: FulfillmentReportFilters = {},
  signal?: AbortSignal
): Promise<FulfillmentReportResult> {
  return request.post<FulfillmentReportResult, FulfillmentReportFilters>('/fulfillment-report', {
    data: filters,
    signal
  })
}
