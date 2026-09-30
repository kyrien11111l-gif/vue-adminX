import { createRouter, createWebHashHistory } from 'vue-router'
import { installRouterGuards } from '@/router/guards'
import { staticRoutes } from '@/router/routes'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes,
})

installRouterGuards(router)
