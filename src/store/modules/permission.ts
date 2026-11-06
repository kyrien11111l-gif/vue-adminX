import { defineStore } from 'pinia'
import type { MenuItem, PermissionSnapshot, PermissionValue } from '@/types'
import { filterAccessibleMenus } from '@/utils/menu'
import { hasPermission as checkPermission } from '@/utils/permission'

interface PermissionState extends PermissionSnapshot {
  initialized: boolean
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    initialized: false,
    menus: [],
    permissions: [],
    homePath: null
  }),
  getters: {
    accessibleMenus: (state): MenuItem[] =>
      filterAccessibleMenus(state.menus, state.permissions),
    hasPermission: (state) => (permission?: PermissionValue) =>
      checkPermission(state.permissions, permission)
  },
  actions: {
    setData(snapshot: PermissionSnapshot) {
      this.menus = snapshot.menus
      this.permissions = snapshot.permissions
      this.homePath = snapshot.homePath
      this.initialized = false
    },
    markInitialized() {
      this.initialized = true
    },
    reset() {
      this.initialized = false
      this.menus = []
      this.permissions = []
      this.homePath = null
    }
  }
})
