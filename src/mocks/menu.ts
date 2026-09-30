import type { MenuItem } from '@/types'

export const mockMenus: MenuItem[] = [
  {
    id: 'dashboard',
    name: '工作台',
    path: 'dashboard',
    component: 'dashboard/index',
    meta: { title: '工作台', icon: 'Odometer', rank: 0, affix: true }
  },
  {
    id: 'system',
    name: '系统管理',
    path: 'system',
    meta: { title: '系统管理', icon: 'Setting', rank: 2 },
    children: [
      {
        id: 'system-user',
        name: '用户管理',
        path: 'user',
        component: 'system/user/index',
        meta: { title: '用户管理', icon: 'User', permission: 'system:user:list' }
      },
      {
        id: 'system-role',
        name: '角色管理',
        path: 'role',
        component: 'system/role/index',
        meta: { title: '角色管理', icon: 'Lock', permission: 'system:role:list' }
      },
      {
        id: 'system-query',
        name: '数据查询',
        path: 'query',
        component: 'system/query/index',
        meta: { title: '数据查询', icon: 'Search', permission: 'system:query:list' }
      },
      {
        id: 'system-audit',
        name: '审计记录',
        path: 'audit',
        component: 'system/audit/index',
        meta: { title: '审计记录', permission: 'system:audit:list', hidden: true }
      },
      {
        id: 'system-missing',
        name: '缺失组件验证',
        path: 'missing',
        component: 'system/missing/index',
        meta: {
          title: '缺失组件验证',
          permission: 'system:not-match:view',
          hidden: true
        }
      }
    ]
  },
  {
    id: 'fullscreen',
    name: '全屏页面',
    path: 'fullscreen',
    component: 'fullscreen/index',
    meta: { title: '全屏页面', icon: 'FullScreen', layout: 'fullpage', rank: 3 }
  },
  {
    id: 'iframe-docs',
    name: '内嵌页面',
    path: 'docs',
    meta: {
      title: '内嵌页面',
      icon: 'Monitor',
      iframe: '/whiteList',
      rank: 4
    }
  },
  {
    id: 'external-vue',
    name: 'Vue 官网',
    path: 'vue',
    meta: { title: 'Vue 官网', icon: 'Link', link: 'https://cn.vuejs.org/', rank: 5 }
  },
  {
    id: 'parent',
    name: '多层管理',
    path: 'parent',
    meta: { title: '多层管理', icon: 'Folder', rank: 6 },
    children: [
      {
        id: 'children',
        name: '第二层',
        path: 'children',
        meta: { title: '第二层', icon: 'FolderOpened' },
        children: [
          {
            id: 'son',
            name: '第三层',
            path: 'son',
            component: 'system/user/index',
            meta: { title: '第三层', permission: 'system:user:list' }
          }
        ]
      }
    ]
  }
]
