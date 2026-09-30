import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLayoutStore } from '@/store'
import { transitionToTheme } from '@/utils/themeTransition'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  Reflect.deleteProperty(document, 'startViewTransition')
  document.documentElement.classList.remove('dark')
  delete document.documentElement.dataset.theme
  document.documentElement.removeAttribute('style')
})

describe('theme transition', () => {
  it('falls back to an immediate theme change when the API is unavailable', () => {
    const layoutStore = useLayoutStore()

    transitionToTheme('dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(layoutStore.themeTransitioning).toBe(false)
  })

  it('applies the new theme inside a view transition and cleans temporary state', async () => {
    const startViewTransition = vi.fn((callback: () => void) => {
      callback()
      return { finished: Promise.resolve() }
    })
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      value: startViewTransition
    })

    const layoutStore = useLayoutStore()
    transitionToTheme('dark')

    expect(startViewTransition).toHaveBeenCalledOnce()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(layoutStore.themeTransitioning).toBe(true)

    await vi.waitFor(() => expect(layoutStore.themeTransitioning).toBe(false))
    expect(document.documentElement.style.getPropertyValue('--theme-transition-radius')).toBe('')
  })
})
