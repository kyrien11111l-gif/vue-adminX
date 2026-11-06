import { describe, expect, it } from 'vitest'
import { mockFetch } from '@/mocks'
import type { ApiResponse } from '@/types'

const baseUrl = 'http://localhost/api'

function loginRequest(username: string, password: string): Promise<Response> {
  return mockFetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
}

describe('mock authentication', () => {
  it('returns an error for invalid credentials', async () => {
    const response = await loginRequest('admin', 'wrong-password')
    const payload = await response.json() as ApiResponse<null>

    expect(response.status).toBe(400)
    expect(payload.code).toBe('AUTH_INVALID_CREDENTIALS')
  })

})
