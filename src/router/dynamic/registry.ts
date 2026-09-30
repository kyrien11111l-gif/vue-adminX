import type { Router } from 'vue-router'
import { APP_ROUTE_NAME } from '@/config/router'
import { generateRoutes } from '@/router/dynamic/generateRoutes'
import type { MenuItem } from '@/types'

const removers: Array<() => void> = []

export function registerDynamicRoutes(router: Router, menus: MenuItem[]): void {
  clearDynamicRoutes()
  const generated = generateRoutes(menus)
  generated.defaultRoutes.forEach((route) =>
    removers.push(router.addRoute(APP_ROUTE_NAME, route))
  )
  generated.fullpageRoutes.forEach((route) =>
    removers.push(router.addRoute(route))
  )
}

export function clearDynamicRoutes(): void {
  removers.splice(0).forEach((remove) => remove())
}
