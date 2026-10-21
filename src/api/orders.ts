import type { OrderFilters, OrderResult } from '@/types'
import { request } from '@/services'

export function queryOrders(
  filters: OrderFilters = {},
  signal?: AbortSignal
): Promise<OrderResult> {
  return request.post<OrderResult, OrderFilters>('/orders', {
    data: filters,
    signal
  })
}
