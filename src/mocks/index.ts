// request.ts keeps this compatibility entry point; MSW intercepts the native fetch call.
export function mockFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, init)
}
