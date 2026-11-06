import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'

const initializeSession = vi.hoisted(() => vi.fn())
const notificationError = vi.hoisted(() => vi.fn())

vi.mock('@/utils/sessionInitialization', () => ({ initializeSession }))
vi.mock('@/router/dynamic/registry', () => ({
  registerDynamicRoutes: vi.fn()
}))
vi.mock('@/router/progress', () => ({
  startRouteProgress: vi.fn(),
  finishRouteProgress: vi.fn()
}))
vi.mock('@/utils/startupLoading', () => ({
  showStartupLoading: vi.fn(),
  hideStartupLoading: vi.fn()
}))
vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn() },
  ElNotification: { error: notificationError }
}))

import { useAuthStore, usePermissionStore } from '@/store'
import { installRouterGuards } from '@/router/guards'

const TestView = defineComponent({
  setup() {
    return () => h('div')
  }
})

describe('router guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthStore().setToken('test-token')
    initializeSession.mockRejectedValue(new Error('菜单服务不可用'))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows initialization failures as a notification and cancels navigation', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/dashboard', component: TestView }]
    })
    installRouterGuards(router)

    await router.push('/dashboard')

    expect(router.currentRoute.value.path).toBe('/')
    expect(notificationError).toHaveBeenCalledWith({
      title: '提示',
      message: '菜单服务不可用',
      showClose: true
    })
    expect(usePermissionStore().initialized).toBe(false)
    expect('error' in usePermissionStore()).toBe(false)
  })
})
