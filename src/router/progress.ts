import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

export function startRouteProgress(): void {
  NProgress.start()
}

export function finishRouteProgress(): void {
  NProgress.done()
}
