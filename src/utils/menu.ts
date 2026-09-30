import type { MenuItem, MenuPathEntry } from '@/types'

export function joinMenuPath(parentPath: string, path: string): string {
  const joined = `${parentPath}/${path}`.replace(/\/{2,}/g, '/')
  return joined.startsWith('/') ? joined : `/${joined}`
}

export function sortMenus(menus: MenuItem[]): MenuItem[] {
  return [...menus].sort(
    (left, right) => (left.meta?.rank ?? 0) - (right.meta?.rank ?? 0)
  )
}

export function filterAccessibleMenus(
  menus: MenuItem[],
  permissions: readonly string[]
): MenuItem[] {
  return sortMenus(menus).flatMap((menu) => {
    const permission = menu.meta?.permission
    if (menu.meta?.hidden || (permission && !permissions.includes(permission))) {
      return []
    }

    const children = menu.children
      ? filterAccessibleMenus(menu.children, permissions)
      : undefined

    if (menu.children?.length && !children?.length) return []
    return [{ ...menu, children }]
  })
}

export function collectMenuPaths(
  menus: MenuItem[],
  parentPath = '',
  ancestors: string[] = []
): MenuPathEntry[] {
  return menus.flatMap((menu) => {
    const key = joinMenuPath(parentPath, menu.path)
    const ownEntry: MenuPathEntry = {
      key,
      ancestors,
      link: menu.meta?.link,
      iframe: menu.meta?.iframe
    }
    const children = menu.children?.length
      ? collectMenuPaths(menu.children, key, [...ancestors, key])
      : []
    return [ownEntry, ...children]
  })
}

export function matchCurrentMenu(
  pathname: string,
  entries: MenuPathEntry[]
): MenuPathEntry | undefined {
  return entries
    .filter(({ key }) => pathname === key || pathname.startsWith(`${key}/`))
    .sort((left, right) => right.key.length - left.key.length)[0]
}

export function findTopLevelMenu(
  pathname: string,
  menus: MenuItem[]
): MenuItem | undefined {
  return menus.find((menu) => {
    const path = joinMenuPath('', menu.path)
    return pathname === path || pathname.startsWith(`${path}/`)
  })
}

export function findMenuByPath(
  menus: MenuItem[],
  targetPath: string,
  parentPath = ''
): MenuItem | undefined {
  for (const menu of menus) {
    const path = joinMenuPath(parentPath, menu.path)
    if (path === targetPath) return menu
    const child = menu.children
      ? findMenuByPath(menu.children, targetPath, path)
      : undefined
    if (child) return child
  }
  return undefined
}

export function findFirstLeafPath(
  menu: MenuItem,
  parentPath = ''
): string | undefined {
  if (menu.meta?.hidden || menu.meta?.link) return undefined
  const path = joinMenuPath(parentPath, menu.path)
  if (!menu.children?.length) return path

  for (const child of sortMenus(menu.children)) {
    const result = findFirstLeafPath(child, path)
    if (result) return result
  }
  return undefined
}

export function findFirstAccessiblePath(
  menus: MenuItem[],
  permissions: readonly string[],
  parentPath = ''
): string | undefined {
  for (const menu of sortMenus(menus)) {
    const permission = menu.meta?.permission
    if (
      menu.meta?.hidden ||
      menu.meta?.link ||
      (permission && !permissions.includes(permission))
    ) {
      continue
    }

    const path = joinMenuPath(parentPath, menu.path)
    if (menu.children?.length) {
      const child = findFirstAccessiblePath(menu.children, permissions, path)
      if (child) return child
      continue
    }
    if (menu.component || menu.meta?.iframe) return path
  }
  return undefined
}

export function resolveMenuUrl(value?: string): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value, window.location.origin)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}
