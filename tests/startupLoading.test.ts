import { describe, expect, it } from 'vitest'
import { hideStartupLoading, showStartupLoading } from '@/utils/startupLoading'

describe('startup loading', () => {
  it('is created by JavaScript and can always be hidden', () => {
    showStartupLoading({ themeMode: 'light', themeColorPrimary: '#409eff' })
    const loading = document.querySelector('#app-startup-loading')
    expect(loading?.textContent).toContain('正在加载中')
    hideStartupLoading()
    expect(loading?.getAttribute('data-state')).toBe('hidden')
  })
})
