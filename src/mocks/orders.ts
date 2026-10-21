import type { OrderFilters, OrderResult, OrderRow, OrderStatus } from '@/types'

const stores = [
  { name: 'newegg GLOBAL SELLING', site: 'Minisforum Official Store' },
  { name: 'newegg GLOBAL SELLING', site: 'Newegg/[NewEgg...]' },
  { name: 'Amazon Global Selling', site: 'Minisforum Official' },
  { name: 'Walmart Marketplace', site: 'Minisforum US' }
]
const products = [
  { name: 'NAB6Lite11US', sku: '2003132167', unitPrice: 0 },
  { name: 'UM750LSlim3US', sku: '407030079', unitPrice: 527 },
  { name: 'UM790Pro16US', sku: '407030112', unitPrice: 563.89 },
  { name: 'MS-A1 Mini Workstation', sku: '407030205', unitPrice: 899 }
]
const recipients = [
  { name: 'Fred Thiel', address: '美国, UT, Pine Valley', postalCode: '84781' },
  { name: 'Christopher Banks', address: '美国, NC, Fayetteville', postalCode: '28304-5830' },
  { name: 'Olivia Martin', address: '美国, CA, San Diego', postalCode: '92101' },
  { name: 'Liam Anderson', address: '美国, TX, Austin', postalCode: '78701' },
  { name: 'Emma Wilson', address: '美国, NY, Buffalo', postalCode: '14202' },
  { name: 'Noah Thompson', address: '美国, WA, Seattle', postalCode: '98101' }
]
const statuses: OrderStatus[] = ['processing', 'pending', 'shipped', 'completed', 'cancelled']
const shippingMethods = ['USPS Ground Advantage', 'UPS Ground', 'FedEx Home Delivery', 'DHL eCommerce']

function money(value: number): number {
  return Math.round(value * 100) / 100
}

function dateTime(index: number, offsetDays = 0): string {
  const day = 7 - Math.floor(index / 6) + offsetDays
  const hour = 8 + (index % 10)
  const minute = (index * 7) % 60
  return `2026-02-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:48`
}

export const orderRows: OrderRow[] = Array.from({ length: 36 }, (_, index) => {
  const sequence = index + 1
  const store = stores[index % stores.length] ?? stores[0]!
  const product = products[index % products.length] ?? products[0]!
  const recipient = recipients[index % recipients.length] ?? recipients[0]!
  const shippedQuantity = index % 5 === 0 ? 2 : 1
  const orderAmount = money(product.unitPrice * shippedQuantity + (index % 3 === 0 ? 36 : 0))
  const fulfillmentCost = money(orderAmount * (0.08 + (index % 4) * 0.02))
  const shippingFee = money(12 + (index % 5) * 4.5)
  const grossProfit = money(orderAmount - fulfillmentCost - shippingFee)

  return {
    id: sequence,
    orderNo: `10366654${String(6968065501 + index * 173).padStart(10, '0')}`,
    storeName: store.name,
    storeSite: store.site,
    orderSource: index % 6 === 0 ? '广告订单' : '线上订单',
    packageWeight: `${(0.42 + (index % 8) * 0.08).toFixed(2)} kg`,
    productName: product.name,
    sku: product.sku,
    orderItemId: product.sku,
    shippedQuantity,
    unitPrice: product.unitPrice,
    reservedQuantity: index % 4 === 0 ? 0 : 1,
    orderAmount,
    fulfillmentCost,
    shippingFee,
    grossProfit,
    grossProfitRate: orderAmount > 0 ? money((grossProfit / orderAmount) * 100) : 0,
    orderTime: dateTime(index),
    latestShipTime: dateTime(index, 2),
    shipTime: index % 4 === 0 ? '—' : dateTime(index, 1),
    markedTime: index % 3 === 0 ? '—' : dateTime(index, 1),
    recipient: recipient.name,
    address: recipient.address,
    postalCode: recipient.postalCode,
    buyerMessage: index % 4 === 0 ? 'Please ship as soon as possible.' : '—',
    shippingMethod: shippingMethods[index % shippingMethods.length] ?? 'UPS Ground',
    trackingNo: index % 4 === 0 ? '待分配' : `1Z999AA${String(sequence).padStart(8, '0')}`,
    status: statuses[index % statuses.length] ?? 'pending'
  }
})

function includes(source: string, filter?: string): boolean {
  return !filter?.trim() || source.toLowerCase().includes(filter.trim().toLowerCase())
}

function timestamp(value?: string, endOfDay = false): number | undefined {
  if (!value) return undefined
  const time = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`).getTime()
  return Number.isNaN(time) ? undefined : time
}

export function orderRowsByFilters(filters: OrderFilters = {}): OrderResult {
  const keyword = filters.keyword?.trim().toLowerCase()
  const dateRange = Array.isArray(filters.dateRange) ? filters.dateRange : []
  const startDate = timestamp(dateRange[0])
  const endDate = timestamp(dateRange[1], true)
  const filtered = orderRows.filter((row) => {
    const orderTime = new Date(row.orderTime.replace(' ', 'T')).getTime()
    const keywordMatches =
      !keyword ||
      [row.orderNo, row.productName, row.sku, row.recipient, row.address, row.trackingNo]
        .some((value) => value.toLowerCase().includes(keyword))

    return (
      keywordMatches &&
      (!filters.store || [row.storeName, row.storeSite].some((value) => includes(value, filters.store))) &&
      (!filters.status || row.status === filters.status) &&
      (startDate === undefined || orderTime >= startDate) &&
      (endDate === undefined || orderTime <= endDate)
    )
  })

  const pageSize = Math.max(1, filters.pageSize ?? (filtered.length || 1))
  const pageCurrent = Math.max(1, filters.pageCurrent ?? 1)
  const start = (pageCurrent - 1) * pageSize
  return { items: filtered.slice(start, start + pageSize), total: filtered.length }
}
