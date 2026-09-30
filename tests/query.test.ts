import { describe, expect, it } from 'vitest'
import { queryRows, queryRowsByFilters } from '@/mocks/queryData'

describe('query mock', () => {
  it('provides 1000 rows and returns 20 rows on the default page size', () => {
    const result = queryRowsByFilters({ pageCurrent: 1, pageSize: 20 })

    expect(queryRows).toHaveLength(1000)
    expect(result.total).toBe(1000)
    expect(result.items).toHaveLength(20)
  })

  it('combines filters and reports total before pagination', () => {
    const result = queryRowsByFilters({ category: 'report', status: 'completed', pageCurrent: 1, pageSize: 3 })
    expect(result.items.length).toBeLessThanOrEqual(3)
    expect(result.total).toBeGreaterThan(0)
    expect(result.items.every((row) => row.category === 'report' && row.status === 'completed')).toBe(true)
  })

  it('uses inclusive date boundaries', () => {
    const result = queryRowsByFilters({ startDate: '2026-09-28', endDate: '2026-09-28' })
    expect(result.items.every((row) => row.updatedAt.startsWith('2026-09-28'))).toBe(true)
  })
})
