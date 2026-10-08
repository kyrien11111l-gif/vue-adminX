<template>
  <div class="common-table flex flex-col" :class="{ 'common-table--fill': fill }">
    <div class="common-table__body">
      <el-table
        ref="tableRef"
        v-bind="tableBindings"
      >
        <template v-if="hasConfiguredColumns">
          <el-table-column
            v-for="(column, index) in visibleColumns"
            :key="getColumnKey(column, index)"
            v-bind="getColumnProps(column)"
          >
            <template v-if="hasSlot(column.headerSlot)" #header="scope">
              <slot
                :name="column.headerSlot"
                v-bind="scope"
                :column-config="column"
              />
            </template>
            <template v-if="hasSlot(column.slot)" #default="scope">
              <slot
                :name="column.slot"
                v-bind="scope"
                :column-config="column"
              />
            </template>
          </el-table-column>
        </template>
        <slot v-else />
        <template v-if="$slots.empty" #empty>
          <slot name="empty" />
        </template>
        <template v-if="$slots.append" #append>
          <slot name="append" />
        </template>
      </el-table>
    </div>

    <div v-if="paginationConfig" class="common-table__pagination shrink-0">
      <el-scrollbar>
        <slot name="pagination" :current-page="currentPage" :page-size="pageSize">
          <el-pagination
            v-bind="paginationProps"
            :current-page="currentPage"
            :page-size="pageSize"
            @update:current-page="onCurrentPageUpdate"
            @update:page-size="onPageSizeUpdate"
            @current-change="onPaginationCurrentChange"
            @size-change="onPaginationSizeChange"
            @change="onPaginationChange"
            @prev-click="onPaginationPrevClick"
            @next-click="onPaginationNextClick"
          />
        </slot>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, watch } from 'vue'
import type { PaginationProps, TableInstance } from 'element-plus'
import type { CommonTableColumn, CommonTableProps } from './types'

defineOptions({ inheritAttrs: false })

const DEFAULT_PAGINATION: Partial<PaginationProps> = {
  pageSize: 20,
  currentPage: 1,
  pageSizes: [20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper'
}

const props = withDefaults(defineProps<CommonTableProps>(), {
  border: true,
  fit: true,
  fill: true,
  showHeader: true,
  selectOnIndeterminate: true,
  allowDragLastColumn: true
})
const attrs = useAttrs()
const slots = useSlots()

const emit = defineEmits<{
  'update:pagination-current-page': [value: number]
  'update:pagination-page-size': [value: number]
  'pagination-current-change': [value: number]
  'pagination-size-change': [value: number]
  'pagination-change': [currentPage: number, pageSize: number]
  'pagination-prev-click': [value: number]
  'pagination-next-click': [value: number]
}>()

const tableRef = ref<TableInstance>()
const currentPage = ref(DEFAULT_PAGINATION.currentPage ?? 1)
const pageSize = ref(DEFAULT_PAGINATION.pageSize ?? 20)
const hasConfiguredColumns = computed(() => props.columns !== undefined)
const visibleColumns = computed(() => props.columns?.filter((column) => column.visible !== false) ?? [])

const tableProps = computed(() => {
  const forwardedProps = { ...props } as Record<string, unknown>
  delete forwardedProps.columns
  delete forwardedProps.pagination
  delete forwardedProps.fill
  return {
    ...forwardedProps,
    border: props.border ?? true
  }
})

const forwardedAttrs = computed(() => {
  const forwarded = { ...attrs }
  delete forwarded.columns
  delete forwarded.pagination
  return forwarded
})

const tableBindings = computed<Record<string, unknown>>(() => {
  const bindings: Record<string, unknown> = {
    ...tableProps.value,
    ...forwardedAttrs.value
  }
  if (props.fill && bindings.height == null && bindings.maxHeight == null) {
    bindings.height = '100%'
  }
  return bindings
})

const paginationConfig = computed<Partial<PaginationProps> | false>(() => {
  if (props.pagination === false) return false
  const customConfig = props.pagination && props.pagination !== true ? props.pagination : {}
  return { ...DEFAULT_PAGINATION, ...customConfig }
})

const paginationProps = computed<Partial<PaginationProps>>(() => {
  if (!paginationConfig.value) return {}
  return {
    ...paginationConfig.value,
    currentPage: currentPage.value,
    pageSize: pageSize.value
  }
})

watch(
  () => props.pagination,
  (config) => {
    if (!config || config === true) return
    if (typeof config.currentPage === 'number') currentPage.value = config.currentPage
    else if (typeof config.defaultCurrentPage === 'number') currentPage.value = config.defaultCurrentPage
    if (typeof config.pageSize === 'number') pageSize.value = config.pageSize
    else if (typeof config.defaultPageSize === 'number') pageSize.value = config.defaultPageSize
  },
  { immediate: true, deep: true }
)

function getColumnKey(column: CommonTableColumn, index: number): string | number {
  return column.key ?? column.columnKey ?? column.prop ?? index
}

function getColumnProps(column: CommonTableColumn): Record<string, unknown> {
  const columnProps = { ...column } as Record<string, unknown>
  delete columnProps.key
  delete columnProps.visible
  delete columnProps.disabled
  delete columnProps.slot
  delete columnProps.headerSlot
  delete columnProps.meta
  if (columnProps.fixed === '') delete columnProps.fixed
  return columnProps
}

function hasSlot(name: unknown): name is string {
  return typeof name === 'string' && Boolean(slots[name])
}

function onCurrentPageUpdate(value: number) {
  currentPage.value = value
  emit('update:pagination-current-page', value)
}

function onPageSizeUpdate(value: number) {
  pageSize.value = value
  emit('update:pagination-page-size', value)
}

function onPaginationCurrentChange(value: number) {
  onCurrentPageUpdate(value)
  emit('pagination-current-change', value)
}

function onPaginationSizeChange(value: number) {
  onPageSizeUpdate(value)
  emit('pagination-size-change', value)
}

function onPaginationChange(value: number, size: number) {
  currentPage.value = value
  pageSize.value = size
  emit('pagination-change', value, size)
}

function onPaginationPrevClick(value: number) {
  currentPage.value = value
  emit('pagination-prev-click', value)
}

function onPaginationNextClick(value: number) {
  currentPage.value = value
  emit('pagination-next-click', value)
}

defineExpose({
  tableRef,
  table: tableRef,
  setCurrentRow: (...args: Parameters<TableInstance['setCurrentRow']>) => tableRef.value?.setCurrentRow(...args),
  getSelectionRows: () => tableRef.value?.getSelectionRows() ?? [],
  getHalfSelectionRows: () => tableRef.value?.getHalfSelectionRows() ?? [],
  toggleRowSelection: (...args: Parameters<TableInstance['toggleRowSelection']>) => tableRef.value?.toggleRowSelection(...args),
  clearSelection: () => tableRef.value?.clearSelection(),
  clearFilter: (...args: Parameters<TableInstance['clearFilter']>) => tableRef.value?.clearFilter(...args),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  toggleRowExpansion: (...args: Parameters<TableInstance['toggleRowExpansion']>) => tableRef.value?.toggleRowExpansion(...args),
  clearSort: () => tableRef.value?.clearSort(),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (...args: Parameters<TableInstance['sort']>) => tableRef.value?.sort(...args),
  updateKeyChildren: (...args: Parameters<TableInstance['updateKeyChildren']>) => tableRef.value?.updateKeyChildren(...args),
  scrollTo: (...args: Parameters<TableInstance['scrollTo']>) => tableRef.value?.scrollTo(...args),
  setScrollLeft: (...args: Parameters<TableInstance['setScrollLeft']>) => tableRef.value?.setScrollLeft(...args),
  setScrollTop: (...args: Parameters<TableInstance['setScrollTop']>) => tableRef.value?.setScrollTop(...args)
})
</script>

<style scoped lang="scss">
.common-table {
  width: 100%;
  min-width: 0;
}

.common-table--fill {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.common-table__body {
  min-width: 0;
}

.common-table--fill .common-table__body {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.common-table__pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}

.common-table :deep(.el-table th.el-table__cell),
.common-table :deep(.el-table td.el-table__cell) {
  text-align: center;
  vertical-align: middle;
}

.common-table :deep(.el-table th.el-table__cell) {
  color: var(--el-text-color-primary);
}
</style>
