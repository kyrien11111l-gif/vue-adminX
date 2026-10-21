import { describe, expect, it } from 'vitest'
import { orderRows, orderRowsByFilters } from '@/mocks/orders'

describe('order mock data', () => {
  it('provides realistic order fields for the grouped table layout', () => {
    expect(orderRows).toHaveLength(36)
    expect(orderRows[0]).toMatchObject({
      orderNo: expect.stringMatching(/^10366654/),
      productName: expect.any(String),
      recipient: expect.any(String),
      orderAmount: expect.any(Number),
      grossProfitRate: expect.any(Number)
    })
  })

  it('filters by store and status', () => {
    const result = orderRowsByFilters({ store: 'Minisforum Official Store', status: 'processing' })

    expect(result.total).toBeGreaterThan(0)
    expect(result.items.every((row) => row.storeSite === 'Minisforum Official Store')).toBe(true)
    expect(result.items.every((row) => row.status === 'processing')).toBe(true)
  })

  it('returns a backend-like paginated result', () => {
    const result = orderRowsByFilters({ pageCurrent: 2, pageSize: 8 })

    expect(result.total).toBe(36)
    expect(result.items).toHaveLength(8)
    expect(result.items[0]?.id).toBe(9)
  })
})
