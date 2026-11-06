import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { request } from '@/services'
import { registerUnauthorizedHandler } from '@/utils/unauthorized'

import { useAuthStore } from '@/store'

describe('request unauthorized handling', () => {
  let handledCount = 0
  let unregister: (() => void) | undefined

  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthStore().setToken('same-token')
    handledCount = 0
    unregister = registerUnauthorizedHandler(() => {
      handledCount += 1
      useAuthStore().clearToken()
    })
  })

  afterEach(() => {
    unregister?.()
    unregister = undefined
  })

  it('handles only the first 401 after the current token is cleared', async () => {
    await Promise.allSettled([
      request.get('/user/info'),
      request.get('/menus'),
      request.get('/permissions')
    ])

    expect(handledCount).toBe(1)
  })
})
