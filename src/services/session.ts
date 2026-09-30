import type { Router } from 'vue-router'
import { clearDynamicRoutes } from '@/router/dynamic/registry'
import {
  useAuthStore,
  usePermissionStore,
  useTabsStore,
  useUserStore
} from '@/store'
import { createLoginUrl } from '@/utils/navigation'

export function resetSession(): void {
  clearDynamicRoutes()
  useAuthStore().clearToken()
  useUserStore().reset()
  usePermissionStore().reset()
  useTabsStore().reset()
}

export async function logoutToLogin(router: Router): Promise<void> {
  const target = router.currentRoute.value.fullPath
  resetSession()
  await router.replace(createLoginUrl(target))
}
