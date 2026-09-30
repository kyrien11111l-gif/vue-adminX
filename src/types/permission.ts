import type { MenuItem } from '@/types/menu'

export interface PermissionSnapshot {
  menus: MenuItem[]
  permissions: string[]
  homePath: string | null
}
