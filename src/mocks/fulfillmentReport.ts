import type {
  FulfillmentReportDetail,
  FulfillmentReportFilters,
  FulfillmentReportResult,
  FulfillmentReportRow
} from '@/types'

export const fulfillmentReportDetails: FulfillmentReportDetail[] = [
  { groupId: 'hp-eu-de-001', operator: 'HP-欧洲卡航专线包裹', country: 'DE', date: '2025-10-10', shippedCount: 2, oversoldCount: 2, destinationRejectCount: 2, clearanceCount: 0, fulfillmentExceptionCount: 0, signedCount: 0, controllableTimeliness: 1.6, destinationRejectTimeliness: 8.1, clearanceTimeliness: null, fulfillmentTimeliness: null, totalSignTimeliness: null },
  { groupId: 'hp-eu-de-001', operator: 'HP-欧洲卡航专线包裹', country: 'DE', date: '2025-10-09', shippedCount: 1, oversoldCount: 1, destinationRejectCount: 1, clearanceCount: 0, fulfillmentExceptionCount: 0, signedCount: 0, controllableTimeliness: 1.6, destinationRejectTimeliness: 9.1, clearanceTimeliness: null, fulfillmentTimeliness: null, totalSignTimeliness: null },
  { groupId: 'hp-eu-de-001', operator: 'HP-欧洲卡航专线包裹', country: 'DE', date: '2025-10-07', shippedCount: 1, oversoldCount: 1, destinationRejectCount: 1, clearanceCount: 0, fulfillmentExceptionCount: 0, signedCount: 0, controllableTimeliness: 4.6, destinationRejectTimeliness: 8.1, clearanceTimeliness: null, fulfillmentTimeliness: null, totalSignTimeliness: null },
  { groupId: 'hp-eu-de-001', operator: 'HP-欧洲卡航专线包裹', country: 'DE', date: '2025-10-05', shippedCount: 3, oversoldCount: 3, destinationRejectCount: 3, clearanceCount: 0, fulfillmentExceptionCount: 0, signedCount: 0, controllableTimeliness: 3.6, destinationRejectTimeliness: 11.2, clearanceTimeliness: null, fulfillmentTimeliness: null, totalSignTimeliness: null },
  { groupId: 'hp-eu-de-002', operator: 'HP-欧洲空运专线/敦刻尔克清仓包-UPS派送', country: 'DE', date: '2025-10-04', shippedCount: 1, oversoldCount: 1, destinationRejectCount: 1, clearanceCount: 1, fulfillmentExceptionCount: 1, signedCount: 1, controllableTimeliness: 9.6, destinationRejectTimeliness: 0, clearanceTimeliness: 2.2, fulfillmentTimeliness: null, totalSignTimeliness: 12.6 },
  { groupId: 'hp-eu-de-003', operator: 'HP-欧洲空运普货包裹清仓包-UPS派送', country: 'DE', date: '2025-10-10', shippedCount: 9, oversoldCount: 9, destinationRejectCount: 9, clearanceCount: 9, fulfillmentExceptionCount: 0, signedCount: 0, controllableTimeliness: 4.2, destinationRejectTimeliness: 0.7, clearanceTimeliness: 3.1, fulfillmentTimeliness: null, totalSignTimeliness: null },
  { groupId: 'hp-eu-de-003', operator: 'HP-欧洲空运普货包裹清仓包-UPS派送', country: 'DE', date: '2025-10-09', shippedCount: 3, oversoldCount: 3, destinationRejectCount: 3, clearanceCount: 3, fulfillmentExceptionCount: 1, signedCount: 1, controllableTimeliness: 4, destinationRejectTimeliness: 0.6, clearanceTimeliness: 3, fulfillmentTimeliness: null, totalSignTimeliness: 10.7 },
  { groupId: 'hp-eu-de-003', operator: 'HP-欧洲空运普货包裹清仓包-UPS派送', country: 'DE', date: '2025-10-07', shippedCount: 1, oversoldCount: 1, destinationRejectCount: 1, clearanceCount: 1, fulfillmentExceptionCount: 1, signedCount: 1, controllableTimeliness: 5.1, destinationRejectTimeliness: 0.7, clearanceTimeliness: 2, fulfillmentTimeliness: null, totalSignTimeliness: 12.8 },
  { groupId: 'hp-eu-de-003', operator: 'HP-欧洲空运普货包裹清仓包-UPS派送', country: 'DE', date: '2025-10-05', shippedCount: 2, oversoldCount: 2, destinationRejectCount: 2, clearanceCount: 2, fulfillmentExceptionCount: 2, signedCount: 2, controllableTimeliness: 7.1, destinationRejectTimeliness: 0.7, clearanceTimeliness: 2, fulfillmentTimeliness: null, totalSignTimeliness: 14.9 },
  { groupId: 'hp-eu-es-001', operator: 'HP-欧洲空运普货包裹清仓包-UPS派送', country: 'ES', date: '2025-10-10', shippedCount: 1, oversoldCount: 1, destinationRejectCount: 1, clearanceCount: 1, fulfillmentExceptionCount: 0, signedCount: 0, controllableTimeliness: 6.1, destinationRejectTimeliness: 0.4, clearanceTimeliness: 3.2, fulfillmentTimeliness: null, totalSignTimeliness: null },
  { groupId: 'hp-eu-es-001', operator: 'HP-欧洲空运普货包裹清仓包-UPS派送', country: 'ES', date: '2025-10-09', shippedCount: 2, oversoldCount: 1, destinationRejectCount: 1, clearanceCount: 1, fulfillmentExceptionCount: 0, signedCount: 1, controllableTimeliness: 5.7, destinationRejectTimeliness: 0.5, clearanceTimeliness: 3.1, fulfillmentTimeliness: null, totalSignTimeliness: 11.4 },
  { groupId: 'hp-eu-es-001', operator: 'HP-欧洲空运普货包裹清仓包-UPS派送', country: 'ES', date: '2025-10-07', shippedCount: 3, oversoldCount: 3, destinationRejectCount: 2, clearanceCount: 2, fulfillmentExceptionCount: 1, signedCount: 1, controllableTimeliness: 6.4, destinationRejectTimeliness: 0.6, clearanceTimeliness: 3.4, fulfillmentTimeliness: null, totalSignTimeliness: 13.2 },
  { groupId: 'hp-eu-fr-001', operator: 'HP-欧洲铁路专线-末端派送', country: 'FR', date: '2025-10-10', shippedCount: 4, oversoldCount: 4, destinationRejectCount: 4, clearanceCount: 3, fulfillmentExceptionCount: 0, signedCount: 2, controllableTimeliness: 3.8, destinationRejectTimeliness: 1.2, clearanceTimeliness: 2.7, fulfillmentTimeliness: 8.6, totalSignTimeliness: 11.9 },
  { groupId: 'hp-eu-fr-001', operator: 'HP-欧洲铁路专线-末端派送', country: 'FR', date: '2025-10-08', shippedCount: 2, oversoldCount: 2, destinationRejectCount: 2, clearanceCount: 2, fulfillmentExceptionCount: 1, signedCount: 1, controllableTimeliness: 4.2, destinationRejectTimeliness: 1.1, clearanceTimeliness: 2.9, fulfillmentTimeliness: 9.1, totalSignTimeliness: 12.4 },
  { groupId: 'hp-eu-nl-001', operator: 'HP-欧洲卡航专线包裹', country: 'NL', date: '2025-10-10', shippedCount: 2, oversoldCount: 2, destinationRejectCount: 2, clearanceCount: 1, fulfillmentExceptionCount: 0, signedCount: 1, controllableTimeliness: 2.9, destinationRejectTimeliness: 1.5, clearanceTimeliness: 2.4, fulfillmentTimeliness: 7.8, totalSignTimeliness: 10.8 },
  { groupId: 'hp-eu-nl-001', operator: 'HP-欧洲卡航专线包裹', country: 'NL', date: '2025-10-06', shippedCount: 5, oversoldCount: 4, destinationRejectCount: 4, clearanceCount: 4, fulfillmentExceptionCount: 1, signedCount: 3, controllableTimeliness: 3.4, destinationRejectTimeliness: 1.7, clearanceTimeliness: 2.6, fulfillmentTimeliness: 8.2, totalSignTimeliness: 11.2 }
]

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

function average(values: ReadonlyArray<number | null>): number | null {
  const validValues = values.filter((value): value is number => value !== null)
  if (!validValues.length) return null
  return Number((sum(validValues) / validValues.length).toFixed(1))
}

function createDetailRow(detail: FulfillmentReportDetail, id: number): FulfillmentReportRow {
  return {
    ...detail,
    id,
    isSubtotal: false,
    signRate: detail.shippedCount ? Number(((detail.signedCount / detail.shippedCount) * 100).toFixed(1)) : 0
  }
}

function createSubtotal(
  group: FulfillmentReportDetail,
  details: readonly FulfillmentReportDetail[],
  id: number
): FulfillmentReportRow {
  const shippedCount = sum(details.map((detail) => detail.shippedCount))
  const signedCount = sum(details.map((detail) => detail.signedCount))
  return {
    id,
    groupId: group.groupId,
    operator: group.operator,
    country: group.country,
    date: '小计',
    isSubtotal: true,
    shippedCount,
    oversoldCount: sum(details.map((detail) => detail.oversoldCount)),
    destinationRejectCount: sum(details.map((detail) => detail.destinationRejectCount)),
    clearanceCount: sum(details.map((detail) => detail.clearanceCount)),
    fulfillmentExceptionCount: sum(details.map((detail) => detail.fulfillmentExceptionCount)),
    signedCount,
    controllableTimeliness: average(details.map((detail) => detail.controllableTimeliness)),
    destinationRejectTimeliness: average(details.map((detail) => detail.destinationRejectTimeliness)),
    clearanceTimeliness: average(details.map((detail) => detail.clearanceTimeliness)),
    fulfillmentTimeliness: average(details.map((detail) => detail.fulfillmentTimeliness)),
    totalSignTimeliness: average(details.map((detail) => detail.totalSignTimeliness)),
    signRate: shippedCount ? Number(((signedCount / shippedCount) * 100).toFixed(1)) : 0
  }
}

function buildReportRows(details: readonly FulfillmentReportDetail[]): FulfillmentReportRow[] {
  const rows: FulfillmentReportRow[] = []
  let detailIndex = 0
  let nextId = 1

  while (detailIndex < details.length) {
    const firstDetail = details[detailIndex]
    if (!firstDetail) break

    const groupDetails: FulfillmentReportDetail[] = [firstDetail]
    detailIndex += 1
    while (details[detailIndex]?.groupId === firstDetail.groupId) {
      const detail = details[detailIndex]
      if (detail) groupDetails.push(detail)
      detailIndex += 1
    }

    rows.push(...groupDetails.map((detail) => createDetailRow(detail, nextId++)))
    rows.push(createSubtotal(firstDetail, groupDetails, nextId++))
  }

  return rows
}

export const fulfillmentReportRows = buildReportRows(fulfillmentReportDetails)

function matchesDetail(row: FulfillmentReportRow, filters: FulfillmentReportFilters): boolean {
  const operator = filters.operator?.trim().toLowerCase()
  const country = filters.country?.trim()
  const dateRange = filters.dateRange ?? []
  const startDate = dateRange[0]
  const endDate = dateRange[1]
  return (
    (!operator || row.operator.toLowerCase().includes(operator)) &&
    (!country || row.country === country) &&
    (!startDate || row.date >= startDate) &&
    (!endDate || row.date <= endDate)
  )
}

export function fulfillmentRowsByFilters(filters: FulfillmentReportFilters = {}): FulfillmentReportResult {
  const detailRows = fulfillmentReportRows.filter((row) => !row.isSubtotal && matchesDetail(row, filters))
  const matchedGroupIds = new Set(detailRows.map((row) => row.groupId))
  const filteredRows = fulfillmentReportRows.filter((row) =>
    matchedGroupIds.has(row.groupId) && (row.isSubtotal || detailRows.includes(row))
  )
  const pageSize = Math.max(1, filters.pageSize ?? (filteredRows.length || 1))
  const pageCurrent = Math.max(1, filters.pageCurrent ?? 1)
  const start = (pageCurrent - 1) * pageSize
  return { items: filteredRows.slice(start, start + pageSize), total: filteredRows.length }
}
