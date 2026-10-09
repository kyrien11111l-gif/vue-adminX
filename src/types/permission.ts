import type { MenuItem } from '@/types/menu'

export type PermissionValue = string | readonly string[]

export interface PermissionSnapshot {
  menus: MenuItem[]
  permissions: string[]
  homePath: string | null
}
