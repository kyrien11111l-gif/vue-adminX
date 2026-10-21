<template>
  <PageContainer>
    <div class="flex min-h-0 flex-1 flex-col">
      <el-card class="mb-4 shrink-0">
        <QueryForm
          v-model="formValues"
          :fields="filterFields"
          :initial-values="initialValues"
          :loading="loading"
          :collapsed-count="3"
          @submit="applyFilters"
          @reset="applyFilters"
        />
      </el-card>

      <el-card body-class="!p-0 !overflow-hidden flex h-full min-h-0 flex-col" class="min-h-0 flex-1">
        <TableToolbar
          title="履约时效报表"
          refreshable
          :refreshing="loading"
          :density="density"
          :column-settings="columns"
          @refresh="refreshData"
          @update:density="setDensity"
          @update:column-settings="setColumnSettings"
          @column-settings-reset="resetColumnSettings"
        >
          <template #actions>
            <el-tag type="info">共 {{ total }} 条</el-tag>
          </template>
        </TableToolbar>

        <CommonTable
          v-loading="loading"
          :data="rows"
          :columns="tableColumns"
          :span-method="spanMethod"
          :row-class-name="rowClassName"
          row-key="id"
          stripe
          border
          :size="density"
          :pagination="pagination"
          :empty-text="loadError || '暂无符合条件的数据'"
          @pagination-current-change="onPageChange"
          @pagination-size-change="onPageSizeChange"
        >
          <template #metric="{ row, columnConfig }">
            {{ formatMetric(row, columnConfig) }}
          </template>
        </CommonTable>
      </el-card>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { queryFulfillmentReport } from '@/api'
import { CommonTable } from '@/components/common-table'
import type { CommonTableColumn, CommonTableProps } from '@/components/common-table'
import { PageContainer } from '@/components/page-container'
import { QueryForm } from '@/components/query-form'
import type { QueryFormField, QueryFormModel, QueryOption } from '@/components/query-form'
import { TableToolbar } from '@/components/table-toolbar'
import type { TableColumnSetting } from '@/components/table-toolbar'
import { useTableSettings } from '@/hooks/useTableSettings'
import type { FulfillmentReportFilters, FulfillmentReportRow } from '@/types'
import { getFulfillmentRowSpan } from './rowSpan'

type ReportColumnKey =
  | 'operator'
  | 'country'
  | 'date'
  | 'shippedCount'
  | 'oversoldCount'
  | 'destinationRejectCount'
  | 'clearanceCount'
  | 'fulfillmentExceptionCount'
  | 'signedCount'
  | 'controllableTimeliness'
  | 'destinationRejectTimeliness'
  | 'clearanceTimeliness'
  | 'fulfillmentTimeliness'
  | 'totalSignTimeliness'
  | 'signRate'

type SpanMethodParams = Parameters<NonNullable<CommonTableProps['spanMethod']>>[0]
type RowClassNameGetter = Exclude<NonNullable<CommonTableProps['rowClassName']>, string>
type RowClassNameParams = Parameters<RowClassNameGetter>[0]

interface ReportColumnSetting extends TableColumnSetting {
  key: ReportColumnKey
  prop?: keyof FulfillmentReportRow
  minWidth: number
  slot?: string
  meta?: { format: 'integer' | 'decimal' | 'percent' }
}

const initialValues: QueryFormModel = { operator: '', country: '', dateRange: [] }
const formValues = ref<QueryFormModel>({ ...initialValues })
const appliedFilters = ref<FulfillmentReportFilters>({})
const loading = ref(false)
const loadError = ref('')
const pageCurrent = ref(1)
const pageSize = ref(10)
const rows = ref<FulfillmentReportRow[]>([])
const total = ref(0)
let controller: AbortController | undefined

const countryOptions: QueryOption[] = [
  { label: '德国（DE）', value: 'DE' },
  { label: '西班牙（ES）', value: 'ES' },
  { label: '法国（FR）', value: 'FR' },
  { label: '荷兰（NL）', value: 'NL' }
]
const filterFields: QueryFormField[] = [
  { type: 'input', prop: 'operator', label: '运营商', props: { placeholder: '请输入运营商名称' } },
  { type: 'select', prop: 'country', label: '国家', props: { placeholder: '全部国家' }, options: countryOptions },
  { type: 'dateRange', prop: 'dateRange', label: '日期范围', props: { type: 'daterange', valueFormat: 'YYYY-MM-DD' } }
]

const defaultColumns: ReportColumnSetting[] = [
  { key: 'operator', prop: 'operator', label: '运营商', minWidth: 260, fixed: 'left' },
  { key: 'country', prop: 'country', label: '国家', minWidth: 84, fixed: 'left' },
  { key: 'date', prop: 'date', label: '日期', minWidth: 112 },
  { key: 'shippedCount', prop: 'shippedCount', label: '发货单量', minWidth: 106, slot: 'metric', meta: { format: 'integer' } },
  { key: 'oversoldCount', prop: 'oversoldCount', label: '超卖单量', minWidth: 106, slot: 'metric', meta: { format: 'integer' } },
  { key: 'destinationRejectCount', prop: 'destinationRejectCount', label: '拒达目的国单量', minWidth: 130, slot: 'metric', meta: { format: 'integer' } },
  { key: 'clearanceCount', prop: 'clearanceCount', label: '清关单量', minWidth: 106, slot: 'metric', meta: { format: 'integer' } },
  { key: 'fulfillmentExceptionCount', prop: 'fulfillmentExceptionCount', label: '履约异常单量', minWidth: 130, slot: 'metric', meta: { format: 'integer' } },
  { key: 'signedCount', prop: 'signedCount', label: '签收单量', minWidth: 106, slot: 'metric', meta: { format: 'integer' } },
  { key: 'controllableTimeliness', prop: 'controllableTimeliness', label: '控时效', minWidth: 100, slot: 'metric', meta: { format: 'decimal' } },
  { key: 'destinationRejectTimeliness', prop: 'destinationRejectTimeliness', label: '拒达目的国时效', minWidth: 136, slot: 'metric', meta: { format: 'decimal' } },
  { key: 'clearanceTimeliness', prop: 'clearanceTimeliness', label: '清关时效', minWidth: 106, slot: 'metric', meta: { format: 'decimal' } },
  { key: 'fulfillmentTimeliness', prop: 'fulfillmentTimeliness', label: '履约时效', minWidth: 106, slot: 'metric', meta: { format: 'decimal' } },
  { key: 'totalSignTimeliness', prop: 'totalSignTimeliness', label: '全程签收时效', minWidth: 130, slot: 'metric', meta: { format: 'decimal' } },
  { key: 'signRate', prop: 'signRate', label: '签收率', minWidth: 100, slot: 'metric', meta: { format: 'percent' } }
]

const {
  density,
  columnSettings: columns,
  visibleColumns,
  setDensity,
  setColumnSettings,
  resetColumnSettings
} = useTableSettings({ columns: defaultColumns, widthField: 'minWidth' })

const tableColumns = computed<CommonTableColumn[]>(() => visibleColumns.value.map((column) => column as CommonTableColumn))
const pagination = computed(() => ({
  currentPage: pageCurrent.value,
  pageSize: pageSize.value,
  pageSizes: [10, 20, 50],
  total: total.value,
  layout: 'total, sizes, prev, pager, next, jumper'
}))

function normalizeFilters(value: QueryFormModel): FulfillmentReportFilters {
  const dateRange = Array.isArray(value.dateRange)
    ? value.dateRange.filter((item): item is string => typeof item === 'string')
    : []
  return {
    operator: typeof value.operator === 'string' ? value.operator : '',
    country: typeof value.country === 'string' ? value.country : '',
    dateRange
  }
}

function applyFilters(value: QueryFormModel) {
  appliedFilters.value = normalizeFilters(value)
  pageCurrent.value = 1
  void loadData()
}

function refreshData() {
  void loadData()
}

async function loadData() {
  controller?.abort()
  const requestController = new AbortController()
  controller = requestController
  loading.value = true
  loadError.value = ''
  try {
    const result = await queryFulfillmentReport({
      ...appliedFilters.value,
      pageCurrent: pageCurrent.value,
      pageSize: pageSize.value
    }, requestController.signal)
      if (controller !== requestController) return
    rows.value = result.items
    total.value = result.total
  } catch (error) {
    if (isRequestCancelled(error)) return
    loadError.value = error instanceof Error ? error.message : '查询失败'
    ElMessage.error(loadError.value)
  } finally {
    if (controller === requestController) loading.value = false
  }
}

function onPageChange(value: number) {
  pageCurrent.value = value
  void loadData()
}

function onPageSizeChange(value: number) {
  pageSize.value = value
  pageCurrent.value = 1
  void loadData()
}

function spanMethod({
  column,
  rowIndex
}: SpanMethodParams) {
  return getFulfillmentRowSpan(rows.value, rowIndex, column.property ?? '')
}

function rowClassName({ row }: RowClassNameParams): string {
  const reportRow = row as unknown as FulfillmentReportRow
  return reportRow.isSubtotal ? 'fulfillment-report__subtotal-row' : ''
}

function formatMetric(row: FulfillmentReportRow, column: CommonTableColumn): string {
  const prop = column.prop
  if (typeof prop !== 'string') return ''
  const value = row[prop as keyof FulfillmentReportRow]
  if (typeof value !== 'number') return ''
  const format = column.meta?.format
  if (format === 'decimal') return value.toFixed(1)
  if (format === 'percent') return `${value.toFixed(1)}%`
  return String(value)
}

function isRequestCancelled(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.message === '请求已取消')
  )
}

onMounted(() => {
  void loadData()
})

onBeforeUnmount(() => controller?.abort())
</script>

<style scoped lang="scss">
:deep(.fulfillment-report__subtotal-row td.el-table__cell) {
  font-weight: 600;
  background-color: var(--el-color-primary-light-9);
}
</style>
