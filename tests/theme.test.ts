import { afterEach, describe, expect, it } from 'vitest'
import { applyThemeSnapshot } from '@/utils/theme'

const root = document.documentElement

afterEach(() => {
  root.classList.remove('dark')
  delete root.dataset.theme
  root.removeAttribute('style')
})

describe('theme variables', () => {
  it('uses the Element Plus light palette in light mode', () => {
    applyThemeSnapshot({ themeMode: 'light', themeColorPrimary: '#409eff' })

    expect(root.style.getPropertyValue('--el-color-primary-light-9')).toBe('#ecf5ff')
    expect(root.style.getPropertyValue('--el-color-primary-dark-2')).toBe('#337ecc')
  })

  it('uses dark palette variants for readable hover states in dark mode', () => {
    applyThemeSnapshot({ themeMode: 'dark', themeColorPrimary: '#409eff' })

    expect(root.classList.contains('dark')).toBe(true)
    expect(root.dataset.theme).toBe('dark')
    expect(root.style.getPropertyValue('--el-color-primary-light-9')).toBe('#18222c')
    expect(root.style.getPropertyValue('--el-color-primary-dark-2')).toBe('#66b1ff')
  })
})
