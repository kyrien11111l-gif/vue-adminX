export type RequestParam = string | number | boolean | null | undefined
export type RequestParams = Record<
  string,
  RequestParam | readonly RequestParam[]
>

export interface RequestConfig<TData = unknown>
  extends Omit<RequestInit, 'body' | 'method' | 'signal'> {
  data?: TData
  params?: RequestParams
  signal?: AbortSignal
  timeout?: number
}
