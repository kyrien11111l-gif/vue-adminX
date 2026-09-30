import { describe, expect, it } from 'vitest'
import type { MenuItem } from '@/types'
import {
  collectMenuPaths,
  filterAccessibleMenus,
  findFirstAccessiblePath,
  joinMenuPath,
  matchCurrentMenu
} from '@/utils/menu'

const menus: MenuItem[] = [
  { id: 'home', name: '首页', path: 'dashboard', component: 'dashboard/index', meta: { rank: 0 } },
  { id: 'system', name: '系统', path: 'system', meta: { rank: 2 }, children: [
    { id: 'user', name: '用户', path: 'user', component: 'system/user/index', meta: { permission: 'user:list' } },
    { id: 'audit', name: '审计', path: 'audit', component: 'system/audit/index', meta: { permission: 'audit:list' } }
  ] }
]

describe('menu utilities', () => {
  it('joins and matches nested paths', () => {
    expect(joinMenuPath('/system', 'user')).toBe('/system/user')
    const entries = collectMenuPaths(menus)
    expect(matchCurrentMenu('/system/user/detail', entries)?.key).toBe('/system/user')
  })

  it('filters inaccessible branches and resolves home', () => {
    const filtered = filterAccessibleMenus(menus, ['audit:list'])
    expect(filtered[1]?.children?.map((item) => item.id)).toEqual(['audit'])
    expect(findFirstAccessiblePath(menus, ['audit:list'])).toBe('/dashboard')
  })
})
