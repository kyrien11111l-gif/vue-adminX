import type { ComponentSize } from 'element-plus'

export type TableDensity = ComponentSize
export type TableColumnFixed = '' | 'left' | 'right'

export interface TableColumnSetting {
  key: string
  label: string
  visible: boolean
  fixed: TableColumnFixed
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
