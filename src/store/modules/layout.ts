import { defineStore } from 'pinia'
import {
  HEADER_HEIGHT,
  PAGE_TABS_HEIGHT,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  SIDE_NAVIGATION,
  TWO_COLUMN_PRIMARY_WIDTH
} from '@/config/layout'
import type {
  NavigationStyle,
  PersistedLayoutState,
  ThemeMode
} from '@/types'
import { readStorage, writeStorage } from '@/utils/storage'

export const LAYOUT_STORAGE_KEY = 'adminx-layout'

const defaults: PersistedLayoutState = {
  collapsed: false,
  navigationStyle: SIDE_NAVIGATION,
  themeMode: 'light',
  themeColorPrimary: '#409eff',
  watermarkEnabled: import.meta.env.VITE_WATERMARK_ENABLED === 'true',
  watermarkContent: import.meta.env.VITE_WATERMARK_CONTENT?.trim() || 'AdminX'
}

interface LayoutState extends PersistedLayoutState {
  darkMode: boolean
  contentMaximized: boolean
  themeTransitioning: boolean
  mobileMenuOpen: boolean
  sidebarWidth: number
  sidebarCollapsedWidth: number
  twoColumnPrimaryWidth: number
  headerHeight: number
  pageTabsHeight: number
}

function initialState(): LayoutState {
  const persisted = readStorage<Partial<PersistedLayoutState>>(
    LAYOUT_STORAGE_KEY,
    {}
  )
  const resolved = { ...defaults, ...persisted }
  const systemDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches

  return {
    ...resolved,
    darkMode:
      resolved.themeMode === 'system'
        ? Boolean(systemDark)
        : resolved.themeMode === 'dark',
    contentMaximized: false,
    themeTransitioning: false,
    mobileMenuOpen: false,
    sidebarWidth: SIDEBAR_WIDTH,
    sidebarCollapsedWidth: SIDEBAR_COLLAPSED_WIDTH,
    twoColumnPrimaryWidth: TWO_COLUMN_PRIMARY_WIDTH,
    headerHeight: HEADER_HEIGHT,
    pageTabsHeight: PAGE_TABS_HEIGHT
  }
}

export const useLayoutStore = defineStore('layout', {
  state: initialState,
  getters: {
    persistedState: (state): PersistedLayoutState => ({
      collapsed: state.collapsed,
      navigationStyle: state.navigationStyle,
      themeMode: state.themeMode,
      themeColorPrimary: state.themeColorPrimary,
      watermarkEnabled: state.watermarkEnabled,
      watermarkContent: state.watermarkContent
    })
  },
  actions: {
    persist() {
      writeStorage(LAYOUT_STORAGE_KEY, this.persistedState)
    },
    setThemeMode(themeMode: ThemeMode) {
      this.themeMode = themeMode
      if (themeMode !== 'system') this.darkMode = themeMode === 'dark'
      this.persist()
    },
    setDarkMode(darkMode: boolean) {
      this.darkMode = darkMode
    },
    setThemeColorPrimary(themeColorPrimary: string) {
      this.themeColorPrimary = themeColorPrimary
      this.persist()
    },
    setNavigationStyle(navigationStyle: NavigationStyle) {
      this.navigationStyle = navigationStyle
      this.persist()
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed
      this.persist()
    },
    toggleContentMaximized() {
      this.contentMaximized = !this.contentMaximized
    },
    setMobileMenuOpen(open: boolean) {
      this.mobileMenuOpen = open
    },
    setWatermarkEnabled(enabled: boolean) {
      this.watermarkEnabled = enabled
      this.persist()
    },
    setWatermarkContent(content: string) {
      this.watermarkContent = content
      this.persist()
    },
    setThemeTransitioning(value: boolean) {
      this.themeTransitioning = value
    }
  }
})
