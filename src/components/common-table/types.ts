import type { PaginationProps, TableProps } from 'element-plus'

/**
 * Pagination configuration for CommonTable.
 *
 * `true` uses the default configuration, while an object can override any
 * Element Plus Pagination prop. Use `false` to hide pagination completely.
 */
export type CommonTablePagination = false | true | Partial<PaginationProps>

/**
 * Declarative column configuration.
 *
 * Element Plus column props can be placed directly on the object. The extra
 * fields below are consumed by CommonTable and are not forwarded to
 * ElTableColumn.
 */
export interface CommonTableColumn {
  /** 允许透传其他 Element Plus TableColumn 属性。 */
  [key: string]: unknown
  /** 配置项的唯一标识，主要用于 Vue 列表渲染和列设置。 */
  key?: string | number
  /** Element Plus 列标识，对应 ElTableColumn 的 columnKey。 */
  columnKey?: string
  /** 列类型，例如 selection、index、expand。 */
  type?: string
  /** 表头显示文字。 */
  label?: string
  /** 行数据对应的字段名。 */
  prop?: string
  /** prop 的兼容别名，对应 Element Plus 的 property。 */
  property?: string
  /** 列的固定宽度。 */
  width?: string | number
  /** 列的最小宽度，表格空间充足时可自动扩展。 */
  minWidth?: string | number
  /** 是否固定列，支持 true、left、right。 */
  fixed?: boolean | string
  /** 单元格内容的水平对齐方式。 */
  align?: string
  /** 表头内容的水平对齐方式。 */
  headerAlign?: string
  /** 内容溢出时是否显示 Tooltip，也可传入 Tooltip 配置。 */
  showOverflowTooltip?: boolean | Record<string, unknown>
  /** 是否显示该列，默认为 true；CommonTable 扩展属性。 */
  visible?: boolean
  /** 是否禁止在列设置中操作该列；CommonTable 扩展属性。 */
  disabled?: boolean
  /** 自定义单元格使用的具名插槽名称；CommonTable 扩展属性。 */
  slot?: string
  /** 自定义表头使用的具名插槽名称；CommonTable 扩展属性。 */
  headerSlot?: string
  /** 业务侧附加数据，不会透传给 ElTableColumn。 */
  meta?: Record<string, unknown>
}

export type CommonTableProps = Partial<TableProps> & {
  columns?: CommonTableColumn[]
  /** 占满父级剩余高度，并让表格内容在内部滚动。 */
  fill?: boolean
  pagination?: CommonTablePagination
}
