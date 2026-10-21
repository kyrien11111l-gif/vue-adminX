import type { FulfillmentReportRow } from '@/types'

export type TableSpan = [rowspan: number, colspan: number]

function getContiguousRowSpan(
  rows: readonly FulfillmentReportRow[],
  rowIndex: number,
  getKey: (row: FulfillmentReportRow) => string
): TableSpan {
  const currentRow = rows[rowIndex]
  if (!currentRow) return [1, 1]

  const currentKey = getKey(currentRow)
  const previousRow = rows[rowIndex - 1]
  if (previousRow && getKey(previousRow) === currentKey) return [0, 0]

  let rowspan = 1
  for (let index = rowIndex + 1; index < rows.length; index += 1) {
    const row = rows[index]
    if (!row || getKey(row) !== currentKey) break
    rowspan += 1
  }
  return [rowspan, 1]
}

export function getFulfillmentRowSpan(
  rows: readonly FulfillmentReportRow[],
  rowIndex: number,
  columnKey: string
): TableSpan {
  if (columnKey === 'operator') {
    return getContiguousRowSpan(rows, rowIndex, (row) => row.operator)
  }
  if (columnKey === 'country') {
    return getContiguousRowSpan(rows, rowIndex, (row) => `${row.operator}::${row.country}`)
  }
  return [1, 1]
}
