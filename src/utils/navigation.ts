import { LOGIN_PATH } from '@/config/router'

export function createLoginUrl(target: string): string {
  return `${LOGIN_PATH}?redirect=${encodeURIComponent(target).replaceAll('%2F', '/')}`
}

export function getRedirectTarget(search: string): string | undefined {
  return new URLSearchParams(search).get('redirect') ?? undefined
}

export function getSafeRedirectTarget(
  value: unknown,
  fallback: string
): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/login')
  ) {
    return fallback
  }
  return value === '/' ? fallback : value
}
