import { describe, expect, it } from 'vitest'
import { createLoginUrl, getSafeRedirectTarget } from '@/utils/navigation'

describe('safe redirects', () => {
  it('preserves an internal full path', () => {
    expect(createLoginUrl('/system/query?page=2')).toContain('redirect=/system/query')
    expect(getSafeRedirectTarget('/system/query?page=2', '/dashboard')).toBe('/system/query?page=2')
  })

  it('rejects external and recursive login redirects', () => {
    expect(getSafeRedirectTarget('//evil.example', '/dashboard')).toBe('/dashboard')
    expect(getSafeRedirectTarget('/login?redirect=/dashboard', '/dashboard')).toBe('/dashboard')
  })
})
