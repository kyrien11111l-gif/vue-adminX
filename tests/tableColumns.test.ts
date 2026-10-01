import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import type { TableColumnSetting } from '@/components/table-toolbar'
import { clampTableColumnWidth, useTableColumns } from '@/hooks/useTableColumns'

type TestColumn = TableColumnSetting & { prop?: string; minWidth?: number; slot?: string }

const defaultColumns: TestColumn[] = [
  { key: 'left', prop: 'left', label: '左列', minWidth: 120, visible: true, fixed: 'left' },
  { key: 'hidden', prop: 'hidden', label: '隐藏列', minWidth: 140, visible: false, fixed: '' },
  { key: 'normal', prop: 'normal', label: '普通列', minWidth: 160, visible: true, fixed: '' },
  { key: 'right', label: '操作', minWidth: 92, visible: true, fixed: 'right', slot: 'operation' }
]

describe('useTableColumns', () => {
  it('returns visible columns ordered by fixed position', () => {
    const { tableColumns } = useTableColumns({ columns: defaultColumns })
    expect(tableColumns.value.map((column) => column.key)).toEqual(['left', 'normal', 'right'])
  })

  it('preserves project column metadata when toolbar settings change', () => {
    const { columnSettings, setColumnSettings } = useTableColumns({ columns: defaultColumns })

    setColumnSettings([
      { key: 'normal', label: '普通列', visible: true, fixed: 'right' },
      { key: 'left', label: '左列', visible: true, fixed: 'left' },
      { key: 'hidden', label: '隐藏列', visible: true, fixed: '' },
      { key: 'right', label: '操作', visible: true, fixed: 'right' }
    ])

    expect(columnSettings.value.map((column) => column.key)).toEqual(['normal', 'left', 'hidden', 'right'])
    expect(columnSettings.value[0]?.prop).toBe('normal')
    expect(columnSettings.value[3]?.slot).toBe('operation')
  })

  it('resizes with limits, resets, and syncs newly supplied definitions', async () => {
    const definitions = ref<TestColumn[]>(defaultColumns)
    const { columnSettings, resizeColumn, setColumnVisible, resetColumnSettings } = useTableColumns({
      columns: definitions,
      minColumnWidth: 90,
      maxColumnWidth: 300,
      widthField: 'minWidth'
    })

    resizeColumn('normal', 999)
    expect(columnSettings.value.find((column) => column.key === 'normal')?.minWidth).toBe(300)
    setColumnVisible('hidden', true)
    expect(columnSettings.value.find((column) => column.key === 'hidden')?.visible).toBe(true)

    resetColumnSettings()
    expect(columnSettings.value.find((column) => column.key === 'hidden')?.visible).toBe(false)
    expect(clampTableColumnWidth(40)).toBe(80)

    definitions.value = [...defaultColumns, { key: 'added', label: '新增列', visible: true, fixed: '', minWidth: 100 }]
    await nextTick()
    expect(columnSettings.value.at(-1)?.key).toBe('added')
  })
})
