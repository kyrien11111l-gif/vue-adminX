export type LayoutMode = 'default' | 'fullpage'

export interface AppRouteMeta {
  title?: string
  icon?: string
  hidden?: boolean
  layout?: LayoutMode
  permission?: string
  keepAlive?: boolean
  rank?: number
  affix?: boolean
  link?: string
  iframe?: string
}

export interface MenuItem {
  id: string
  name: string
  path: string
  component?: string
  children?: MenuItem[]
  meta?: AppRouteMeta
}

export interface MenuPathEntry {
  key: string
  ancestors: string[]
  link?: string
  iframe?: string
}
