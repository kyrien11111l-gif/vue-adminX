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
})
