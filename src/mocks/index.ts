import { mockMenus } from '@/mocks/menu'
import { queryRowsByFilters } from '@/mocks/queryData'
import type {
  ApiResponse,
  LoginCredentials,
  LoginResult,
  QueryFilters,
  UserInfo
} from '@/types'

interface MockProfile {
  token: string
  password: string
  user: UserInfo
  permissions: string[]
}

const profiles: Record<string, MockProfile> = {
  admin: {
    token: 'mock-token-admin',
    password: '123456',
    user: { id: 1, username: 'admin', nickname: 'Administrator', roles: ['admin'] },
    permissions: [
      'system:user:list',
      'system:user:create',
      'system:role:list',
      'system:query:list',
      'system:audit:list',
      'system:not-match:view'
    ]
  },
  auditor: {
    token: 'mock-token-auditor',
    password: '123456',
    user: { id: 2, username: 'auditor', nickname: '审计专员', roles: ['auditor'] },
    permissions: ['system:query:list', 'system:audit:list']
  }
}

function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

function success<T>(data: T): Response {
  return json<ApiResponse<T>>({ code: 0, message: 'success', data })
}

function parseBody<T>(body: BodyInit | null | undefined): T | null {
  if (typeof body !== 'string') return null
  try {
    return JSON.parse(body) as T
  } catch {
    return null
  }
}

function getProfile(headers?: HeadersInit): MockProfile | undefined {
  const authorization = new Headers(headers).get('Authorization')
  const token = authorization?.replace(/^Bearer\s+/i, '')
  return Object.values(profiles).find((profile) => profile.token === token)
}

function delay(signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
      return
    }
    const timeout = window.setTimeout(resolve, 350)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout)
        reject(signal.reason)
      },
      { once: true }
    )
  })
}

export async function mockFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  await delay(init?.signal)
  const url = input instanceof URL
    ? input
    : new URL(typeof input === 'string' ? input : input.url, window.location.origin)
  const path = url.pathname.replace(/^\/api(?=\/|$)/, '') || '/'
  const method = (init?.method ?? 'GET').toUpperCase()

  if (path === '/login' && method === 'POST') {
    const credentials = parseBody<LoginCredentials>(init?.body)
    const profile = credentials ? profiles[credentials.username] : undefined
    if (!profile || profile.password !== credentials?.password) {
      return json<ApiResponse<null>>(
        { code: 'AUTH_INVALID_CREDENTIALS', message: '用户名或密码错误', data: null },
        400
      )
    }
    return success<LoginResult>({ token: profile.token })
  }

  const profile = getProfile(init?.headers)
  if (!profile) {
    return json<ApiResponse<null>>(
      { code: 'UNAUTHORIZED', message: '登录状态已失效', data: null },
      401
    )
  }

  if (path === '/user/info' && method === 'GET') return success(profile.user)
  if (path === '/menus' && method === 'GET') return success(mockMenus)
  if (path === '/permissions' && method === 'GET') return success(profile.permissions)
  if (path === '/query' && method === 'POST') {
    return success(queryRowsByFilters(parseBody<QueryFilters>(init?.body) ?? {}))
  }

  return json<ApiResponse<null>>(
    { code: 'NOT_FOUND', message: `Mock endpoint not found: ${method} ${path}`, data: null },
    404
  )
}
