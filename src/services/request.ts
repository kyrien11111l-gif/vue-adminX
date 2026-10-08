import { mockFetch } from '@/mocks'
import { handleUnauthorizedOnce } from '@/utils/unauthorized'
import { useAuthStore } from '@/store'
import type { ApiResponse } from '@/types'
import type { RequestConfig, RequestParam, RequestParams } from '@/services/types'

const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL?.trim() ?? ''
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
export const DEFAULT_REQUEST_TIMEOUT = 30_000

export interface RequestError extends Error {
  status?: number
  code?: number | string
}

function requestError(
  message: string,
  status?: number,
  code?: number | string
): RequestError {
  const error = new Error(message) as RequestError
  error.name = 'RequestError'
  error.status = status
  error.code = code
  return error
}

export function isRequestError(error: unknown): error is RequestError {
  return error instanceof Error && error.name === 'RequestError'
}

function createUrl(path: string): URL {
  if (/^[a-z][\w+.-]*:/i.test(path)) return new URL(path)
  const base = API_PROXY_URL.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return new URL(`${base}${normalizedPath}`, window.location.origin)
}

function appendParam(url: URL, key: string, value: RequestParam): void {
  if (value === null || value === undefined) return
  url.searchParams.append(key, String(value))
}

function appendParams(url: URL, params?: RequestParams): void {
  if (!params) return
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => appendParam(url, key, item))
    else appendParam(url, key, value as RequestParam)
  })
}

function isNativeBody(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer
  )
}

async function execute<T, TData = unknown>(
  method: string,
  path: string,
  config: RequestConfig<TData> = {}
): Promise<T> {
  const {
    data,
    params,
    signal: externalSignal,
    timeout = DEFAULT_REQUEST_TIMEOUT,
    headers: configuredHeaders,
    ...fetchConfig
  } = config
  const url = createUrl(path)
  appendParams(url, params)
  const headers = new Headers(configuredHeaders)
  const token = useAuthStore().token
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let body: BodyInit | undefined
  if (data !== undefined) {
    if (isNativeBody(data)) body = data
    else {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(data)
    }
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort(new DOMException('Request timeout', 'TimeoutError')),
    timeout
  )
  const abort = () => controller.abort(externalSignal?.reason)
  externalSignal?.addEventListener('abort', abort, { once: true })

  let response: Response
  try {
    response = await (USE_MOCK ? mockFetch : fetch)(url, {
      ...fetchConfig,
      method,
      headers,
      body,
      signal: controller.signal
    })
  } catch (error) {
    if (controller.signal.aborted) {
      const timedOut = controller.signal.reason instanceof DOMException &&
        controller.signal.reason.name === 'TimeoutError'
      throw requestError(timedOut ? '请求超时，请稍后重试' : '请求已取消')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', abort)
  }

  const payload = response.status === 204
    ? null
    : await response.json().catch(() => null) as unknown

  if (response.status === 401) {
    await handleUnauthorizedOnce()
    throw requestError('登录状态已失效', 401, 'UNAUTHORIZED')
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String(payload.message)
        : `请求失败（${response.status}）`
    throw requestError(message, response.status)
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    'code' in payload &&
    'message' in payload &&
    'data' in payload
  ) {
    const apiPayload = payload as ApiResponse<T>
    if (apiPayload.code !== 0 && apiPayload.code !== '0') {
      throw requestError(apiPayload.message, response.status, apiPayload.code)
    }
    return apiPayload.data
  }

  return payload as T
}

export const request = {
  get: <T>(path: string, config?: RequestConfig) =>
    execute<T>('GET', path, config),
  post: <T, TData = unknown>(path: string, config?: RequestConfig<TData>) =>
    execute<T, TData>('POST', path, config),
  put: <T, TData = unknown>(path: string, config?: RequestConfig<TData>) =>
    execute<T, TData>('PUT', path, config),
  patch: <T, TData = unknown>(path: string, config?: RequestConfig<TData>) =>
    execute<T, TData>('PATCH', path, config),
  delete: <T, TData = unknown>(path: string, config?: RequestConfig<TData>) =>
    execute<T, TData>('DELETE', path, config)
}
