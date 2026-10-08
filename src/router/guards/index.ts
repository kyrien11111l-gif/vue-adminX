import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'
import {
  FORBIDDEN_PATH,
  LOGIN_PATH,
  WHITE_LIST
} from '@/config/router'
import { registerDynamicRoutes } from '@/router/dynamic/registry'
import { finishRouteProgress, startRouteProgress } from '@/router/progress'
import { initializeSession } from '@/utils/sessionInitialization'
import { useAuthStore, useLayoutStore, usePermissionStore } from '@/store'
import { createLoginUrl, getSafeRedirectTarget } from '@/utils/navigation'
import { hideStartupLoading, showStartupLoading } from '@/utils/startupLoading'

export function installRouterGuards(router: Router): void {
  router.beforeEach(async (to) => {
    startRouteProgress()
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()
    const isLogin = to.path === LOGIN_PATH
    const isPublic = WHITE_LIST.has(to.path)

    if (permissionStore.error && to.path === '/initialization-error') return true
    if (isPublic && !isLogin) return true

    if (!authStore.token) {
      if (isLogin) return true
      return createLoginUrl(to.fullPath)
    }

    if (!permissionStore.initialized) {
      const layoutStore = useLayoutStore()
      showStartupLoading(layoutStore.persistedState)
      try {
        const snapshot = await initializeSession()
        registerDynamicRoutes(router, snapshot.menus)
        permissionStore.markInitialized()
        const fallback = snapshot.homePath ?? FORBIDDEN_PATH
        if (isLogin) {
          return getSafeRedirectTarget(
            typeof to.query.redirect === 'string' ? to.query.redirect : undefined,
            fallback
          )
        }
        if (to.path === '/') return fallback
        return {
          path: to.path,
          query: to.query,
          hash: to.hash,
          replace: true
        }
      } catch (error) {
        if (!useAuthStore().token) return createLoginUrl(to.fullPath)
        permissionStore.setError(
          error instanceof Error ? error.message : '应用初始化失败，请稍后重试'
        )
        return {
          path: '/initialization-error',
          query: { redirect: to.fullPath },
          replace: true
        }
      }
    }

    if (isLogin) {
      return getSafeRedirectTarget(
        typeof to.query.redirect === 'string' ? to.query.redirect : undefined,
        permissionStore.homePath ?? FORBIDDEN_PATH
      )
    }
    if (to.path === '/') return permissionStore.homePath ?? FORBIDDEN_PATH
    if (!permissionStore.hasPermission(to.meta.permission)) return FORBIDDEN_PATH
    return true
  })

  router.afterEach((_to, _from, failure) => {
    finishRouteProgress()
    hideStartupLoading()
    if (failure) console.warn('路由导航未完成：', failure)
  })

  router.onError((error) => {
    finishRouteProgress()
    hideStartupLoading()
    ElMessage.error(error.message || '页面加载失败')
  })
}
