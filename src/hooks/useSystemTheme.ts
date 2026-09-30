import { storeToRefs } from 'pinia'
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useLayoutStore } from '@/store'
import type { ThemeMode } from '@/types'
import { applyThemeSnapshot } from '@/utils/theme'

export function useSystemTheme() {
  const layoutStore = useLayoutStore()
  const { themeMode, themeColorPrimary } = storeToRefs(layoutStore)
  let mediaQuery: MediaQueryList | undefined

  const apply = () => {
    const dark = applyThemeSnapshot({
      themeMode: themeMode.value,
      themeColorPrimary: themeColorPrimary.value
    })
    layoutStore.setDarkMode(dark)
  }

  const setThemeMode = (mode: ThemeMode) => {
    layoutStore.setThemeMode(mode)
    apply()
  }

  const onSystemThemeChange = () => {
    if (themeMode.value === 'system') apply()
  }

  watch([themeMode, themeColorPrimary], apply)

  onMounted(() => {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', onSystemThemeChange)
    apply()
  })

  onBeforeUnmount(() =>
    mediaQuery?.removeEventListener('change', onSystemThemeChange)
  )

  return { setThemeMode, applyTheme: apply }
}
