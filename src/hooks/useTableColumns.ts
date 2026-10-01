import { computed, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { TableColumnSetting, TableColumnFixed } from '@/components/table-toolbar'

const DEFAULT_MIN_COLUMN_WIDTH = 80
const DEFAULT_MAX_COLUMN_WIDTH = 600

export type ManagedTableColumn = TableColumnSetting & {
  minWidth?: string | number
}

export interface UseTableColumnsOptions<TColumn extends ManagedTableColumn> {
  columns: MaybeRefOrGetter<readonly TColumn[]>
  minColumnWidth?: number
  maxColumnWidth?: number
  /** Element Plus supports both width and minWidth; choose the field used by the page's column model. */
  widthField?: 'width' | 'minWidth'
}

function cloneColumns<TColumn extends ManagedTableColumn>(columns: readonly TColumn[]): TColumn[] {
  return columns.map((column) => ({ ...column }))
}

function mergeColumnDefinitions<TColumn extends ManagedTableColumn>(
  definitions: readonly TColumn[],
  currentColumns: readonly TColumn[]
): TColumn[] {
  const definitionsByKey = new Map(definitions.map((column) => [column.key, column]))
  const currentKeys = new Set(currentColumns.map((column) => column.key))
  const retained = currentColumns.flatMap((current) => {
    const definition = definitionsByKey.get(current.key)
    if (!definition) return []
    return [{
      ...definition,
      visible: current.visible,
      fixed: current.fixed,
      ...(current.width === undefined ? {} : { width: current.width }),
      ...(current.minWidth === undefined ? {} : { minWidth: current.minWidth })
    } as TColumn]
  })
  const added = definitions.filter((column) => !currentKeys.has(column.key))
  return [...retained, ...cloneColumns(added)]
}

export function clampTableColumnWidth(width: number, minWidth = DEFAULT_MIN_COLUMN_WIDTH, maxWidth = DEFAULT_MAX_COLUMN_WIDTH) {
  return Math.min(Math.max(Math.round(width), minWidth), maxWidth)
}

export function useTableColumns<TColumn extends ManagedTableColumn>(options: UseTableColumnsOptions<TColumn>) {
  const sourceColumns = computed(() => toValue(options.columns))
  const columnSettings = shallowRef<TColumn[]>(cloneColumns(sourceColumns.value))
  const orderedColumns = computed(() => [
    ...columnSettings.value.filter((column) => column.fixed === 'left'),
    ...columnSettings.value.filter((column) => column.fixed === ''),
    ...columnSettings.value.filter((column) => column.fixed === 'right')
  ])
  const visibleColumns = computed(() => orderedColumns.value.filter((column) => column.visible))

  watch(sourceColumns, (definitions) => {
    columnSettings.value = mergeColumnDefinitions(definitions, columnSettings.value)
  }, { deep: true })

  function setColumnSettings(settings: readonly TableColumnSetting[]) {
    const currentByKey = new Map(columnSettings.value.map((column) => [column.key, column]))
    columnSettings.value = settings.flatMap((setting) => {
      const current = currentByKey.get(setting.key)
      return current ? [{ ...current, visible: setting.visible, fixed: setting.fixed }] : []
    })
  }

  function updateColumn(key: string, update: Partial<Pick<TableColumnSetting, 'visible' | 'fixed'>>) {
    columnSettings.value = columnSettings.value.map((column) => column.key === key ? { ...column, ...update } : column)
  }

  function setColumnVisible(key: string, visible: boolean) {
    updateColumn(key, { visible })
  }

  function setColumnFixed(key: string, fixed: TableColumnFixed) {
    updateColumn(key, { fixed })
  }

  function resizeColumn(key: string, width: number) {
    const minWidth = options.minColumnWidth ?? DEFAULT_MIN_COLUMN_WIDTH
    const maxWidth = options.maxColumnWidth ?? DEFAULT_MAX_COLUMN_WIDTH
    const nextWidth = clampTableColumnWidth(width, minWidth, maxWidth)
    const widthField = options.widthField ?? 'width'
    columnSettings.value = columnSettings.value.map((column) => column.key === key ? { ...column, [widthField]: nextWidth } : column)
  }

  function resetColumnSettings() {
    columnSettings.value = cloneColumns(sourceColumns.value)
  }

  return {
    columnSettings,
    tableColumns: visibleColumns,
    visibleColumns,
    setColumnSettings,
    setColumnVisible,
    setColumnFixed,
    resizeColumn,
    resetColumnSettings
  }
}
