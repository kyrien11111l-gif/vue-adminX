import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { request } from '@/services'

describe('mock authentication', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('returns an error for invalid credentials', async () => {
    await expect(
      request.post('/login', {
        data: { username: 'admin', password: 'wrong-password' }
      })
    ).rejects.toMatchObject({
      status: 400,
      message: '用户名或密码错误'
    })
  })
})
