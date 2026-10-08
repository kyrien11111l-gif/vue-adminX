import { describe, expect, it } from 'vitest'
import { mockMenus } from '@/mocks/menu'
import { generateRoutes } from '@/router/dynamic/generateRoutes'

describe('dynamic route generation', () => {
  it('passes keepAlive metadata from the mock query menu to its route', () => {
    const { defaultRoutes } = generateRoutes(mockMenus)
    const queryRoute = defaultRoutes.find((route) => route.path === '/system/query')

    expect(queryRoute?.meta?.keepAlive).toBe(true)
  })
})
