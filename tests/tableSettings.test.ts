import { describe, expect, it } from 'vitest'
import type { TableColumnSetting } from '@/components/table-toolbar'
import { useTableSettings } from '@/hooks/useTableSettings'

describe('useTableSettings', () => {
  it('combines Element Plus density with reusable column state', () => {
    const columns: TableColumnSetting[] = [
      { key: 'name', label: '名称', visible: true, fixed: '' }
    ]
    const settings = useTableSettings({ columns, defaultDensity: 'small' })

    expect(settings.density.value).toBe('small')
    expect(settings.visibleColumns.value.map((column) => column.key)).toEqual(['name'])

    settings.setDensity('large')
    expect(settings.density.value).toBe('large')
  })
})
