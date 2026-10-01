import { shallowRef } from 'vue'
import type { TableDensity } from '@/components/table-toolbar'
import { useTableColumns } from '@/hooks/useTableColumns'
import type { ManagedTableColumn, UseTableColumnsOptions } from '@/hooks/useTableColumns'

export interface UseTableSettingsOptions<TColumn extends ManagedTableColumn> extends UseTableColumnsOptions<TColumn> {
  defaultDensity?: TableDensity
}

export function useTableSettings<TColumn extends ManagedTableColumn>(options: UseTableSettingsOptions<TColumn>) {
  const density = shallowRef<TableDensity>(options.defaultDensity ?? 'default')
  const columnState = useTableColumns(options)

  function setDensity(value: TableDensity) {
    density.value = value
  }

  return {
    ...columnState,
    density,
    setDensity
  }
}
