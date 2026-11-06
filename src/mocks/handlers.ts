import { http, HttpResponse } from 'msw'
import type { DefaultBodyType } from 'msw'
import { fulfillmentRowsByFilters } from '@/mocks/fulfillmentReport'
import { mockMenus } from '@/mocks/menu'
import { orderRowsByFilters } from '@/mocks/orders'
import { queryRowsByFilters } from '@/mocks/queryData'
import type {
  FulfillmentReportFilters,
  LoginCredentials,
  LoginResult,
  OrderFilters,
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
      'system:fulfillment:list',
      'system:order:list',
      'system:audit:list',
      'system:not-match:view'
    ]
  },
  auditor: {
    token: 'mock-token-auditor',
    password: '123456',
    user: { id: 2, username: 'auditor', nickname: '审计专员', roles: ['auditor'] },
    permissions: [
      'system:query:list',
      'system:fulfillment:list',
      'system:order:list',
      'system:audit:list'
    ]
  }
}

const API_PREFIX = (import.meta.env.VITE_API_PROXY_URL?.trim() ?? '').replace(/\/+$/, '')

function endpoint(path: string): string {
  return `${API_PREFIX}${path}` || path
}

function success<T>(data: T): HttpResponse<DefaultBodyType> {
  return HttpResponse.json({ code: 0, message: 'success', data })
}

function unauthorized(): HttpResponse<DefaultBodyType> {
  return HttpResponse.json(
    { code: 'UNAUTHORIZED', message: '登录状态已失效', data: null },
    { status: 401 }
  )
}

function notFound(method: string, path: string): HttpResponse<DefaultBodyType> {
  return HttpResponse.json(
    { code: 'NOT_FOUND', message: `Mock endpoint not found: ${method} ${path}`, data: null },
    { status: 404 }
  )
}

async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T
  } catch {
    return null
  }
}

function getProfile(request: Request): MockProfile | undefined {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  return Object.values(profiles).find((profile) => profile.token === token)
}

function delay(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }

    const timeout = setTimeout(resolve, 350)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeout)
        reject(signal.reason)
      },
      { once: true }
    )
  })
}

export const handlers = [
  http.post(endpoint('/login'), async ({ request }) => {
    await delay(request.signal)
    const credentials = await parseBody<LoginCredentials>(request)
    const profile = credentials ? profiles[credentials.username] : undefined

    if (!profile || profile.password !== credentials?.password) {
      return HttpResponse.json(
        { code: 'AUTH_INVALID_CREDENTIALS', message: '用户名或密码错误', data: null },
        { status: 400 }
      )
    }

    return success<LoginResult>({ token: profile.token })
  }),

  http.get(endpoint('/user/info'), async ({ request }) => {
    await delay(request.signal)
    const profile = getProfile(request)
    return profile ? success(profile.user) : unauthorized()
  }),

  http.get(endpoint('/menus'), async ({ request }) => {
    await delay(request.signal)
    return getProfile(request) ? success(mockMenus) : unauthorized()
  }),

  http.get(endpoint('/permissions'), async ({ request }) => {
    await delay(request.signal)
    const profile = getProfile(request)
    return profile ? success(profile.permissions) : unauthorized()
  }),

  http.post(endpoint('/query'), async ({ request }) => {
    await delay(request.signal)
    if (!getProfile(request)) return unauthorized()
    return success(queryRowsByFilters(await parseBody<QueryFilters>(request) ?? {}))
  }),

  http.post(endpoint('/fulfillment-report'), async ({ request }) => {
    await delay(request.signal)
    if (!getProfile(request)) return unauthorized()
    return success(
      fulfillmentRowsByFilters(await parseBody<FulfillmentReportFilters>(request) ?? {})
    )
  }),

  http.post(endpoint('/orders'), async ({ request }) => {
    await delay(request.signal)
    if (!getProfile(request)) return unauthorized()
    return success(orderRowsByFilters(await parseBody<OrderFilters>(request) ?? {}))
  }),

  http.all(endpoint('/*'), ({ request }) => notFound(request.method, new URL(request.url).pathname))
]
