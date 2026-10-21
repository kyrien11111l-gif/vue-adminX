import { describe, expect, it } from 'vitest'
import { mockMenus } from '@/mocks/menu'
import { generateRoutes } from '@/router/dynamic/generateRoutes'

describe('dynamic route generation', () => {
  it('passes keepAlive metadata from the mock query menu to its route', () => {
    const { defaultRoutes } = generateRoutes(mockMenus)
    const queryRoute = defaultRoutes.find((route) => route.path === '/system/query')

    expect(queryRoute?.meta?.keepAlive).toBe(true)
  })

  it('generates the fulfillment report route from the mock menu', () => {
    const { defaultRoutes } = generateRoutes(mockMenus)
    const reportRoute = defaultRoutes.find((route) => route.path === '/system/fulfillment-report')

    expect(reportRoute?.meta?.permission).toBe('system:fulfillment:list')
    expect(reportRoute?.meta?.title).toBe('履约时效报表')
  })

  it('generates the orders route from the mock menu', () => {
    const { defaultRoutes } = generateRoutes(mockMenus)
    const ordersRoute = defaultRoutes.find((route) => route.path === '/system/orders')

    expect(ordersRoute?.meta?.permission).toBe('system:order:list')
    expect(ordersRoute?.meta?.title).toBe('订单管理')
  })
})
