type UnauthorizedHandler = () => void | Promise<void>

let handler: UnauthorizedHandler | undefined
let activeHandling: Promise<void> | null = null

export function registerUnauthorizedHandler(nextHandler: UnauthorizedHandler) {
  handler = nextHandler
  return () => {
    if (handler === nextHandler) handler = undefined
  }
}

export function handleUnauthorizedOnce(): Promise<void> {
  if (activeHandling) return activeHandling
  activeHandling = Promise.resolve(handler?.()).finally(() => {
    activeHandling = null
  })
  return activeHandling
}
