import { useLayoutStore } from '@/store'
import type { ThemeMode } from '@/types'
import { applyThemeSnapshot } from '@/utils/theme'

type AnimatedThemeMode = Exclude<ThemeMode, 'system'>

interface ThemeTransitionTrigger {
  currentTarget: EventTarget | null
  clientX: number
  clientY: number
  detail: number
}

interface ViewTransitionResult {
  finished: Promise<void>
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionResult
}

let transitionRunning = false

function applyTheme(nextTheme: AnimatedThemeMode) {
  const layoutStore = useLayoutStore()
  layoutStore.setThemeMode(nextTheme)
  const dark = applyThemeSnapshot(layoutStore.persistedState)
  layoutStore.setDarkMode(dark)
}

function clearTransitionStyles() {
  const root = document.documentElement
  root.style.removeProperty('--theme-transition-x')
  root.style.removeProperty('--theme-transition-y')
  root.style.removeProperty('--theme-transition-radius')
}

export function transitionToTheme(
  nextTheme: AnimatedThemeMode,
  event?: ThemeTransitionTrigger
) {
  const layoutStore = useLayoutStore()
  if (transitionRunning || layoutStore.themeTransitioning) return

  if (layoutStore.darkMode === (nextTheme === 'dark')) {
    applyTheme(nextTheme)
    return
  }

  const transitionDocument = document as ViewTransitionDocument
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!transitionDocument.startViewTransition || reduceMotion) {
    applyTheme(nextTheme)
    return
  }

  const target = event?.currentTarget instanceof HTMLElement
    ? event.currentTarget
    : undefined
  const bounds = target?.getBoundingClientRect()
  const fallbackX = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2
  const fallbackY = bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2
  const x = event && event.detail !== 0 ? event.clientX : fallbackX
  const y = event && event.detail !== 0 ? event.clientY : fallbackY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const root = document.documentElement
  root.style.setProperty('--theme-transition-x', `${x}px`)
  root.style.setProperty('--theme-transition-y', `${y}px`)
  root.style.setProperty('--theme-transition-radius', `${endRadius}px`)

  transitionRunning = true
  layoutStore.setThemeTransitioning(true)

  let viewTransition: ViewTransitionResult
  try {
    viewTransition = transitionDocument.startViewTransition(() => applyTheme(nextTheme))
  } catch {
    clearTransitionStyles()
    transitionRunning = false
    layoutStore.setThemeTransitioning(false)
    applyTheme(nextTheme)
    return
  }

  void viewTransition.finished
    .catch(() => undefined)
    .finally(() => {
      clearTransitionStyles()
      transitionRunning = false
      useLayoutStore().setThemeTransitioning(false)
    })
}
