export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'

export interface OrderFilters {
  keyword?: string
  store?: string
  status?: OrderStatus | ''
  dateRange?: string[]
  pageSize?: number
  pageCurrent?: number
}

export interface OrderRow {
  id: number
  orderNo: string
  storeName: string
  storeSite: string
  orderSource: string
  packageWeight: string
  productName: string
  sku: string
  orderItemId: string
  shippedQuantity: number
  unitPrice: number
  reservedQuantity: number
  orderAmount: number
  fulfillmentCost: number
  shippingFee: number
  grossProfit: number
  grossProfitRate: number
  orderTime: string
  latestShipTime: string
  shipTime: string
  markedTime: string
  recipient: string
  address: string
  postalCode: string
  buyerMessage: string
  shippingMethod: string
  trackingNo: string
  status: OrderStatus
}

export interface OrderResult {
  items: OrderRow[]
  total: number
}
