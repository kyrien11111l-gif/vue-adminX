import type { CSSProperties } from 'vue'

export interface PageContainerProps {
  /** 覆盖容器高度；数字按 px 处理。 */
  height?: CSSProperties['height']
  /** 在 Header 与 Tabs 之外继续扣除的高度。 */
  offset?: number
  /** 容器最小高度；数字按 px 处理。 */
  minHeight?: CSSProperties['minHeight']
}
