import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types'
import { joinMenuPath, sortMenus } from '@/utils/menu'
import { loadRouteComponent } from '@/router/dynamic/componentLoader'

export interface GeneratedRoutes {
  defaultRoutes: RouteRecordRaw[]
  fullpageRoutes: RouteRecordRaw[]
}

export function generateRoutes(menus: MenuItem[]): GeneratedRoutes {
  const result: GeneratedRoutes = { defaultRoutes: [], fullpageRoutes: [] }

  const visit = (
    items: MenuItem[],
    parentPath = '',
    breadcrumbs: string[] = []
  ) => {
    sortMenus(items).forEach((menu) => {
      const path = joinMenuPath(parentPath, menu.path)
      const title = menu.meta?.title ?? menu.name
      const nextBreadcrumbs = [...breadcrumbs, title]
      if (menu.meta?.link) return

      if (menu.children?.length) {
        visit(menu.children, path, nextBreadcrumbs)
        return
      }

      const route: RouteRecordRaw = {
        path,
        name: `dynamic-${menu.id}`,
        component: loadRouteComponent(menu.component, menu.meta?.iframe),
        meta: {
          ...menu.meta,
          title,
          menuId: menu.id,
          breadcrumbs: nextBreadcrumbs
        }
      }
      if (menu.meta?.layout === 'fullpage') result.fullpageRoutes.push(route)
      else result.defaultRoutes.push(route)
    })
  }

  visit(menus)
  return result
}
