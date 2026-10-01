<template>
  <PageContainer class="p-4">
    <div class="flex min-h-0 flex-1 flex-col">
      <el-card class="mb-4 shrink-0">
        <QueryForm
          v-model="formValues"
          :fields="fields"
          :initial-values="initialValues"
          :loading="loading"
          :collapsed-count="4"
          @submit="submitQuery"
          @reset="resetQuery"
          @options-error="onOptionsError"
        >
          <template #field-priority="{ model }">
            <el-segmented v-model="model.priority" :options="priorityOptions" />
          </template>
        </QueryForm>
      </el-card>

      <el-card body-class="!p-0 !overflow-hidden flex h-full min-h-0 flex-col" class="min-h-0 flex-1">
        <TableToolbar
          title="查询结果"
          refreshable
          :refreshing="loading"
          :density="density"
          :column-settings="columns"
          @refresh="loadData"
          @update:density="setDensity"
          @update:column-settings="setColumnSettings"
          @column-settings-reset="resetColumnSettings"
        >
          <template #actions>
            <el-tag v-if="selectedRows.length" type="primary">已选择 {{ selectedRows.length }} 项</el-tag>
            <span class="text-xs text-[var(--el-text-color-secondary)]">共 {{ total }} 条</span>
          </template>
        </TableToolbar>

        <CommonTable
          v-loading="loading"
          :data="rows"
          :columns="tableColumns"
          :empty-text="loadError || '暂无数据'"
          row-key="id"
          stripe
          border
          :size="density"
          :pagination="{ currentPage: pageCurrent, pageSize, total }"
          @selection-change="selectedRows = $event"
          @pagination-current-change="onPageChange"
          @pagination-size-change="onPageSizeChange"
        >
          <template #filter-header="{ columnConfig }">
            <div class="flex items-center justify-center gap-1">
              <span>{{ columnConfig.label }}</span>
              <el-popover placement="bottom" :width="220" trigger="click">
                <template #reference><el-button text circle size="small" :icon="Filter" :aria-label="`筛选${columnConfig.label}`" /></template>
                <el-input
                  :model-value="headerFilters[getColumnKey(columnConfig)]"
                  clearable
                  :placeholder="`筛选${columnConfig.label}`"
                  @update:model-value="setHeaderFilter(getColumnKey(columnConfig), $event)"
                  @keyup.enter="applyHeaderFilter"
                />
                <div class="mt-3 flex justify-end gap-2"><el-button size="small" @click="clearHeaderFilter(getColumnKey(columnConfig))">清除</el-button><el-button size="small" type="primary" @click="applyHeaderFilter">应用</el-button></div>
              </el-popover>
            </div>
          </template>
          <template #category="{ row }">{{ categoryLabel(row.category) }}</template>
          <template #status="{ row }"><el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag></template>
          <template #priority="{ row }"><el-tag :type="priorityType(row.priority)" effect="plain">{{ priorityLabel(row.priority) }}</el-tag></template>
          <template #operation="{ row }"><el-button link type="primary" @click="showDetail(row)">查看</el-button></template>
        </CommonTable>
      </el-card>

      <el-dialog v-model="detailOpen" title="任务详情" width="min(680px, 92vw)">
        <el-descriptions v-if="activeRow" :column="1" border>
          <el-descriptions-item label="工单号">{{ activeRow.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="请求 ID">{{ activeRow.requestId }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ activeRow.title }}</el-descriptions-item>
          <el-descriptions-item label="说明">{{ activeRow.description }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ activeRow.remark }}</el-descriptions-item>
        </el-descriptions>
        <template #footer><el-button type="primary" @click="detailOpen = false">关闭</el-button></template>
      </el-dialog>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Filter } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { TagProps } from 'element-plus'
import { queryData } from '@/api'
import { CommonTable } from '@/components/common-table'
import type { CommonTableColumn } from '@/components/common-table'
import { PageContainer } from '@/components/page-container'
import { QueryForm } from '@/components/query-form'
import type { QueryFormField, QueryFormModel } from '@/components/query-form'
import { TableToolbar } from '@/components/table-toolbar'
import type { TableColumnSetting } from '@/components/table-toolbar'
import { useTableSettings } from '@/hooks/useTableSettings'
import type { QueryFilters, QueryPriority, QueryRow, QueryStatus } from '@/types'

type DataColumnKey = keyof QueryRow
type ColumnKey = DataColumnKey | 'operation'
interface ColumnSetting extends TableColumnSetting {
  key: ColumnKey
  minWidth: number
  prop?: DataColumnKey
  slot?: string
  headerSlot?: string
  showOverflowTooltip?: boolean
}
type TagType = TagProps['type']

const initialValues: QueryFormModel = { keyword: '', category: '', status: '', dateRange: [], department: '', processor: '', priority: 'all' }
const formValues = ref<QueryFormModel>({ ...initialValues })
const submittedValues = ref<QueryFormModel>({ ...initialValues })
const loading = ref(false)
const loadError = ref('')
const rows = ref<QueryRow[]>([])
const total = ref(0)
const pageCurrent = ref(1)
const pageSize = ref(20)
const selectedRows = ref<QueryRow[]>([])
const detailOpen = ref(false)
const activeRow = ref<QueryRow>()
let controller: AbortController | undefined

const fields: QueryFormField[] = [
  { type: 'input', prop: 'keyword', label: '关键词', props: { placeholder: '工单号、标题、申请人' } },
  { type: 'select', prop: 'category', label: '业务类型', props: { placeholder: '全部类型' }, loadOptions: async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    return Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))
  } },
  { type: 'select', prop: 'status', label: '处理状态', props: { placeholder: '全部状态' }, options: [
    { value: 'pending', label: '待处理' }, { value: 'processing', label: '处理中' },
    { value: 'completed', label: '已完成' }, { value: 'failed', label: '失败' }
  ] },
  { type: 'dateRange', prop: 'dateRange', label: '更新时间', props: { unlinkPanels: true } },
  { type: 'input', prop: 'department', label: '所属部门', props: { placeholder: '输入部门' } },
  { type: 'input', prop: 'processor', label: '处理人', props: { placeholder: '输入处理人' } },
  { type: 'custom', prop: 'priority', label: '优先级', slotName: 'priority' }
]
const priorityOptions = [{ label: '全部', value: 'all' }, { label: '高', value: 'high' }, { label: '中', value: 'medium' }, { label: '低', value: 'low' }]
const defaultColumns: ColumnSetting[] = [
  { key: 'orderNo', prop: 'orderNo', label: '工单号', minWidth: 150, visible: true, disabled: true, fixed: 'left', headerSlot: 'filter-header' },
  { key: 'title', prop: 'title', label: '任务标题', minWidth: 190, visible: true, fixed: '', headerSlot: 'filter-header' },
  { key: 'requestId', prop: 'requestId', label: '请求 ID', minWidth: 220, visible: true, fixed: '', headerSlot: 'filter-header', showOverflowTooltip: true },
  { key: 'category', prop: 'category', label: '类型', minWidth: 120, visible: true, fixed: '', slot: 'category' },
  { key: 'applicant', prop: 'applicant', label: '申请人', minWidth: 110, visible: true, fixed: '', headerSlot: 'filter-header' },
  { key: 'department', prop: 'department', label: '部门', minWidth: 130, visible: true, fixed: '', headerSlot: 'filter-header' },
  { key: 'status', prop: 'status', label: '状态', minWidth: 110, visible: true, fixed: '', slot: 'status' },
  { key: 'priority', prop: 'priority', label: '优先级', minWidth: 100, visible: true, fixed: '', slot: 'priority' },
  { key: 'processor', prop: 'processor', label: '处理人', minWidth: 110, visible: true, fixed: '', headerSlot: 'filter-header' },
  { key: 'updatedAt', prop: 'updatedAt', label: '更新时间', minWidth: 165, visible: true, fixed: '' },
  { key: 'description', prop: 'description', label: '任务说明', minWidth: 260, visible: false, fixed: '', headerSlot: 'filter-header', showOverflowTooltip: true },
  { key: 'remark', prop: 'remark', label: '备注', minWidth: 260, visible: false, fixed: '', headerSlot: 'filter-header', showOverflowTooltip: true },
  { key: 'source', prop: 'source', label: '来源', minWidth: 100, visible: false, fixed: '' },
  { key: 'duration', prop: 'duration', label: '耗时', minWidth: 100, visible: false, fixed: '' },
  { key: 'operation', label: '操作', minWidth: 92, visible: true, fixed: 'right', slot: 'operation' }
]
const {
  density,
  columnSettings: columns,
  visibleColumns,
  setDensity,
  setColumnSettings,
  resetColumnSettings
} = useTableSettings({ columns: defaultColumns })
const tableColumns = computed<CommonTableColumn[]>(() => [
  { key: 'selection', type: 'selection', width: 44, fixed: 'left' },
  ...visibleColumns.value.map((column) => column as CommonTableColumn)
])
const headerFilters = reactive<Partial<Record<ColumnKey, string>>>({})
const statusMeta: Record<QueryStatus, { label: string; type: TagType }> = {
  pending: { label: '待处理', type: 'warning' }, processing: { label: '处理中', type: 'primary' }, completed: { label: '已完成', type: 'success' }, failed: { label: '失败', type: 'danger' }
}
const priorityMeta: Record<QueryPriority, { label: string; type: TagType }> = {
  high: { label: '高', type: 'danger' }, medium: { label: '中', type: 'warning' }, low: { label: '低', type: 'info' }
}
const categoryLabels = { 'data-sync': '数据同步', report: '报表导出', 'access-review': '权限复核' }

function valuesToFilters(): QueryFilters {
  const range = Array.isArray(submittedValues.value.dateRange) ? submittedValues.value.dateRange : []
  const text = (key: string) => String(submittedValues.value[key] ?? '').trim() || undefined
  return {
    keyword: text('keyword'), category: text('category') as QueryFilters['category'], status: text('status') as QueryFilters['status'],
    department: text('department'), processor: text('processor'), priority: text('priority') as QueryFilters['priority'],
    startDate: range[0], endDate: range[1], pageCurrent: pageCurrent.value, pageSize: pageSize.value,
    orderNo: headerFilters.orderNo, title: headerFilters.title, requestId: headerFilters.requestId, applicant: headerFilters.applicant,
    description: headerFilters.description, remark: headerFilters.remark
  }
}

async function loadData() {
  controller?.abort()
  controller = new AbortController()
  loading.value = true
  loadError.value = ''
  try {
    const result = await queryData(valuesToFilters(), controller.signal)
    rows.value = result.items
    total.value = result.total
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    loadError.value = error instanceof Error ? error.message : '查询失败'
    ElMessage.error(loadError.value)
  } finally {
    loading.value = false
  }
}
function submitQuery(value: QueryFormModel) { submittedValues.value = { ...value }; pageCurrent.value = 1; void loadData() }
function resetQuery(value: QueryFormModel) { submittedValues.value = { ...value }; Object.keys(headerFilters).forEach((key) => delete headerFilters[key as ColumnKey]); pageCurrent.value = 1; void loadData() }
function applyHeaderFilter() { pageCurrent.value = 1; void loadData() }
function clearHeaderFilter(key: ColumnKey) { delete headerFilters[key]; applyHeaderFilter() }
function getColumnKey(column: CommonTableColumn): ColumnKey { return column.key as ColumnKey }
function setHeaderFilter(key: ColumnKey, value: string) { headerFilters[key] = value }
function onPageChange(value: number) { pageCurrent.value = value; void loadData() }
function onPageSizeChange(value: number) { pageSize.value = value; pageCurrent.value = 1; void loadData() }
function statusType(value: unknown): TagType { return statusMeta[value as QueryStatus]?.type ?? 'info' }
function statusLabel(value: unknown): string { return statusMeta[value as QueryStatus]?.label ?? String(value) }
function priorityType(value: unknown): TagType { return priorityMeta[value as QueryPriority]?.type ?? 'info' }
function priorityLabel(value: unknown): string { return priorityMeta[value as QueryPriority]?.label ?? String(value) }
function categoryLabel(value: unknown): string { return categoryLabels[value as keyof typeof categoryLabels] ?? String(value) }
function showDetail(row: QueryRow) { activeRow.value = row; detailOpen.value = true }
function onOptionsError() { ElMessage.warning('异步选项加载失败，可再次展开重试') }



onMounted(() => {
  void loadData()
})
onBeforeUnmount(() => controller?.abort())
</script>
