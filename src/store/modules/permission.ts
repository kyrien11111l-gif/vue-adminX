import { defineStore } from 'pinia'
import type { MenuItem, PermissionSnapshot, PermissionValue } from '@/types'
import { filterAccessibleMenus } from '@/utils/menu'
import { hasPermission as checkPermission } from '@/utils/permission'

interface PermissionState extends PermissionSnapshot {
  initialized: boolean
  error: string | null
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    initialized: false,
    error: null,
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
      this.error = null
      this.initialized = false
    },
    markInitialized() {
      this.initialized = true
      this.error = null
    },
    setError(error: string | null) {
      this.error = error
      this.initialized = false
    },
    reset() {
      this.initialized = false
      this.error = null
      this.menus = []
      this.permissions = []
      this.homePath = null
    }
  }
})
