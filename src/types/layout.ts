export type ThemeMode = 'light' | 'dark' | 'system'

export type NavigationStyle =
  | 'side-navigation'
  | 'top-navigation'
  | 'two-column-navigation'
  | 'mixed-navigation'

export interface LayoutTab {
  key: string
  title: string
  closable: boolean
}

export interface PersistedLayoutState {
  collapsed: boolean
  navigationStyle: NavigationStyle
  themeMode: ThemeMode
  themeColorPrimary: string
  watermarkEnabled: boolean
  watermarkContent: string
}
