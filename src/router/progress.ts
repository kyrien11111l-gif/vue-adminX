import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, easing: 'ease' })

export function startRouteProgress(): void {
  NProgress.start()
}

export function finishRouteProgress(): void {
  NProgress.done()
}
