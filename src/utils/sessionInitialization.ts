import { getMenus, getPermissions, getUserInfo } from '@/api'
import { usePermissionStore, useTabsStore, useUserStore } from '@/store'
import type { PermissionSnapshot } from '@/types'
import { findFirstAccessiblePath, findMenuByPath } from '@/utils/menu'

let activeInitialization: Promise<PermissionSnapshot> | null = null

export function initializeSession(): Promise<PermissionSnapshot> {
  const permissionStore = usePermissionStore()
  if (permissionStore.initialized) {
    return Promise.resolve({
      menus: permissionStore.menus,
      permissions: permissionStore.permissions,
      homePath: permissionStore.homePath
    })
  }
  if (activeInitialization) return activeInitialization

  activeInitialization = Promise.all([
    getUserInfo(),
    getMenus(),
    getPermissions()
  ])
    .then(([user, menus, permissions]) => {
      const homePath = findFirstAccessiblePath(menus, permissions) ?? null
      const snapshot = { menus, permissions, homePath }
      useUserStore().setUser(user)
      permissionStore.setData(snapshot)
      const homeMenu = homePath ? findMenuByPath(menus, homePath) : undefined
      useTabsStore().setHomeTab(
        homePath
          ? {
              key: homePath,
              title: homeMenu?.meta?.title ?? homeMenu?.name ?? homePath,
              closable: false
            }
          : null
      )
      return snapshot
    })
    .finally(() => {
      activeInitialization = null
    })

  return activeInitialization
}
