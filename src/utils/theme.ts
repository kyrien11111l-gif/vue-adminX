import type { PersistedLayoutState, ThemeMode } from '@/types'

function normalizeHex(color: string): string {
  const value = color.replace('#', '').trim()
  if (/^[\da-f]{3}$/i.test(value)) {
    return `#${[...value].map((part) => `${part}${part}`).join('')}`
  }
  return /^[\da-f]{6}$/i.test(value) ? `#${value}` : '#409eff'
}

function mixColor(color: string, target: string, ratio: number): string {
  const source = normalizeHex(color).slice(1)
  const destination = normalizeHex(target).slice(1)
  const channels = [0, 2, 4].map((offset) => {
    const left = Number.parseInt(source.slice(offset, offset + 2), 16)
    const right = Number.parseInt(destination.slice(offset, offset + 2), 16)
    return Math.round(left + (right - left) * ratio)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${channels.join('')}`
}

export function resolveDarkMode(themeMode: ThemeMode): boolean {
  if (themeMode === 'dark') return true
  if (themeMode === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function applyPrimaryColor(color: string, dark = false): void {
  const root = document.documentElement
  const primary = normalizeHex(color)
  const lightMixTarget = dark ? '#141414' : '#ffffff'
  const darkMixTarget = dark ? '#ffffff' : '#000000'
  root.style.setProperty('--app-primary', primary)
  root.style.setProperty('--el-color-primary', primary)
  ;[3, 5, 7, 8, 9].forEach((level) => {
    root.style.setProperty(
      `--el-color-primary-light-${level}`,
      mixColor(primary, lightMixTarget, level / 10)
    )
  })
  root.style.setProperty('--el-color-primary-dark-2', mixColor(primary, darkMixTarget, 0.2))
}

export function applyThemeSnapshot(
  state: Pick<PersistedLayoutState, 'themeMode' | 'themeColorPrimary'>
): boolean {
  const dark = resolveDarkMode(state.themeMode)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  document.documentElement.style.setProperty(
    '--app-background',
    dark
      ? 'var(--el-bg-color-page, #141414)'
      : 'var(--el-bg-color-page, #ffffff)'
  )
  applyPrimaryColor(state.themeColorPrimary, dark)
  return dark
}
