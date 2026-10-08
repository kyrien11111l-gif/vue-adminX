import type { ComponentSize } from 'element-plus'

export type TableDensity = ComponentSize
export type TableColumnFixed = '' | 'left' | 'right'

export interface TableColumnSetting {
  key: string
  label: string
  /** 是否显示该列，省略时默认为 true。 */
  visible?: boolean
  /** 固定位置，省略时默认为不固定。 */
  fixed?: TableColumnFixed
  width?: number
  disabled?: boolean
}

export interface TableToolbarProps {
  title?: string
  refreshing?: boolean
  refreshable?: boolean
  density?: TableDensity
  columnSettings?: TableColumnSetting[]
}
