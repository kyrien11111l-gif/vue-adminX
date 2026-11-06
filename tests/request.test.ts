import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const fetchMock = vi.hoisted(() => vi.fn())
const handleUnauthorizedOnce = vi.hoisted(() => vi.fn())

vi.mock('@/mocks', () => ({ mockFetch: fetchMock }))
vi.mock('@/utils/unauthorized', () => ({ handleUnauthorizedOnce }))

import { request } from '@/services/request'
import { useAuthStore } from '@/store'

function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ code: 'UNAUTHORIZED', message: '登录状态已失效', data: null }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  )
}

describe('request unauthorized handling', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthStore().setToken('same-token')
    vi.stubGlobal('fetch', fetchMock)
    handleUnauthorizedOnce.mockImplementation(() => {
      useAuthStore().clearToken()
    })
    fetchMock.mockResolvedValue(unauthorizedResponse())
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('handles only the first 401 after the current token is cleared', async () => {
    await Promise.allSettled([
      request.get('/user/info'),
      request.get('/menus'),
      request.get('/permissions')
    ])

    expect(handleUnauthorizedOnce).toHaveBeenCalledTimes(1)
  })
})
