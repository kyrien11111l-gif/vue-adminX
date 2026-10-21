import { describe, expect, it } from 'vitest'
import { fulfillmentReportDetails, fulfillmentReportRows, fulfillmentRowsByFilters } from '@/mocks/fulfillmentReport'
import { getFulfillmentRowSpan } from '@/views/system/fulfillment-report/rowSpan'

describe('fulfillment report mock', () => {
  it('stores every detail as a flat record with its group fields', () => {
    expect(fulfillmentReportDetails).toHaveLength(16)
    expect(fulfillmentReportDetails[0]).toMatchObject({
      groupId: 'hp-eu-de-001',
      operator: 'HP-欧洲卡航专线包裹',
      country: 'DE',
      date: '2025-10-10'
    })
    expect(fulfillmentReportDetails.every((detail) => detail.groupId && detail.operator && detail.country)).toBe(true)
  })

  it('keeps the subtotal row inside the merged operator and country cells', () => {
    const firstGroupRows = fulfillmentReportRows.filter((row) => row.groupId === 'hp-eu-de-001')
    const subtotalIndex = firstGroupRows.findIndex((row) => row.isSubtotal)

    expect(getFulfillmentRowSpan(firstGroupRows, 0, 'operator')).toEqual([5, 1])
    expect(getFulfillmentRowSpan(firstGroupRows, 0, 'country')).toEqual([5, 1])
    expect(getFulfillmentRowSpan(firstGroupRows, 1, 'operator')).toEqual([0, 0])
    expect(getFulfillmentRowSpan(firstGroupRows, subtotalIndex, 'country')).toEqual([0, 0])
  })

  it('does not merge the first group with the next operator group', () => {
    const firstTwoGroups = fulfillmentReportRows.slice(0, 7)

    expect(getFulfillmentRowSpan(firstTwoGroups, 0, 'operator')).toEqual([5, 1])
    expect(getFulfillmentRowSpan(firstTwoGroups, 5, 'operator')).toEqual([2, 1])
  })

  it('keeps matching detail rows and their subtotal when filters are applied', () => {
    const result = fulfillmentRowsByFilters({ country: 'ES', dateRange: ['2025-10-09', '2025-10-10'] })

    expect(result.total).toBe(3)
    expect(result.items.length).toBe(3)
    expect(result.items.every((row) => row.country === 'ES')).toBe(true)
    expect(result.items.at(-1)?.isSubtotal).toBe(true)
  })

  it('returns only the requested page while preserving the filtered total', () => {
    const result = fulfillmentRowsByFilters({ pageCurrent: 2, pageSize: 5 })

    expect(result.total).toBe(22)
    expect(result.items).toHaveLength(5)
    expect(result.items[0]?.id).toBe(6)
  })
})
