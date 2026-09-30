import type { RouteRecordRaw } from 'vue-router'
import { APP_ROUTE_NAME } from '@/config/router'

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/whiteList',
    name: 'white-list',
    component: () => import('@/views/white-list/index.vue'),
    meta: { public: true, title: '白名单页面' }
  },
  {
    path: '/',
    name: APP_ROUTE_NAME,
    component: () => import('@/layout/index.vue'),
    children: [
      {
        path: '403',
        name: 'forbidden',
        component: () => import('@/views/error/403/index.vue'),
        meta: { title: '403' }
      }
    ]
  },
  {
    path: '/initialization-error',
    name: 'initialization-error',
    component: () => import('@/views/error/initialization-error/index.vue'),
    meta: { title: '初始化失败' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/404/index.vue'),
    meta: { title: '404' }
  }
]
