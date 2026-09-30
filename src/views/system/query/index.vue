<template>
  <div class="page-shell flex min-h-full flex-col m-4">
    <PageHeader title="数据查询" description="组合筛选业务任务，并对当前结果执行列设置与导出。">
      <el-button :icon="Download" :disabled="!total" @click="exportCsv">导出 CSV</el-button>
    </PageHeader>

    <el-card shadow="never" class="mb-4 shrink-0">
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

    <el-card shadow="never" body-class="!p-0" class="min-h-0 flex-1">
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div class="flex items-center gap-3">
          <span class="font-medium">查询结果</span>
          <el-tag v-if="selectedRows.length" type="primary">已选择 {{ selectedRows.length }} 项</el-tag>
          <span class="text-xs text-[var(--el-text-color-secondary)]">共 {{ total }} 条</span>
        </div>
        <div class="flex items-center gap-1">
          <el-tooltip content="刷新"><el-button text circle :icon="Refresh" aria-label="刷新查询结果" :loading="loading" @click="loadData" /></el-tooltip>
          <el-dropdown @command="setDensity">
            <el-button text><el-icon><Operation /></el-icon><span class="ml-1 hidden sm:inline">密度</span></el-button>
            <template #dropdown><el-dropdown-menu><el-dropdown-item command="large">宽松</el-dropdown-item><el-dropdown-item command="default">默认</el-dropdown-item><el-dropdown-item command="small">紧凑</el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
          <el-popover placement="bottom-end" :width="320" trigger="click">
            <template #reference><el-button text :icon="Setting">列设置</el-button></template>
            <div class="mb-2 flex items-center justify-between"><strong>显示与顺序</strong><el-button link type="primary" @click="resetColumns">重置</el-button></div>
            <el-scrollbar max-height="340px">
              <div v-for="(column, index) in columns" :key="column.key" class="flex items-center gap-2 border-b border-b-[var(--el-border-color-lighter)] py-2 last:border-0">
                <el-checkbox v-model="column.visible" :disabled="column.required" class="min-w-0 flex-1">{{ column.label }}</el-checkbox>
                <el-button text circle :icon="ArrowUp" :disabled="index === 0" aria-label="上移列" @click="moveColumn(index, -1)" />
                <el-button text circle :icon="ArrowDown" :disabled="index === columns.length - 1" aria-label="下移列" @click="moveColumn(index, 1)" />
                <el-dropdown @command="(value: string) => column.fixed = value as ColumnFixed">
                  <el-button link>{{ fixedLabel(column.fixed) }}</el-button>
                  <template #dropdown><el-dropdown-menu><el-dropdown-item command="">不固定</el-dropdown-item><el-dropdown-item command="left">左固定</el-dropdown-item><el-dropdown-item command="right">右固定</el-dropdown-item></el-dropdown-menu></template>
                </el-dropdown>
              </div>
            </el-scrollbar>
          </el-popover>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="rows"
        row-key="id"
        stripe
        border
        :size="density"
        :empty-text="loadError || '暂无数据'"
        @selection-change="selectedRows = $event"
        @header-dragend="onHeaderDragEnd"
      >
        <el-table-column type="selection" width="44" fixed="left" />
        <el-table-column
          v-for="column in visibleColumns"
          :key="column.key"
          :prop="column.key"
          :label="column.label"
          :min-width="column.width"
          :fixed="column.fixed || undefined"
          :show-overflow-tooltip="column.key === 'description' || column.key === 'remark' || column.key === 'requestId'"
        >
          <template #header>
            <div class="flex items-center gap-1">
              <span>{{ column.label }}</span>
              <el-popover v-if="column.filterable" placement="bottom" :width="220" trigger="click">
                <template #reference><el-button text circle size="small" :icon="Filter" :aria-label="`筛选${column.label}`" /></template>
                <el-input v-model="headerFilters[column.key]" clearable :placeholder="`筛选${column.label}`" @keyup.enter="applyHeaderFilter" />
                <div class="mt-3 flex justify-end gap-2"><el-button size="small" @click="clearHeaderFilter(column.key)">清除</el-button><el-button size="small" type="primary" @click="applyHeaderFilter">应用</el-button></div>
              </el-popover>
            </div>
          </template>
          <template #default="{ row }">
            <el-tag v-if="column.key === 'status'" :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
            <el-tag v-else-if="column.key === 'priority'" :type="priorityType(row.priority)" effect="plain">{{ priorityLabel(row.priority) }}</el-tag>
            <span v-else-if="column.key === 'category'">{{ categoryLabel(row.category) }}</span>
            <span v-else>{{ row[column.key] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="92" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="showDetail(row)">查看</el-button></template></el-table-column>
      </el-table>
      <div class="flex justify-end p-4">
        <el-pagination
          v-model:current-page="pageCurrent"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @current-change="loadData"
          @size-change="onPageSizeChange"
        />
      </div>
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
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ArrowDown, ArrowUp, Download, Filter, Operation, Refresh, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ComponentSize, TagProps } from 'element-plus'
import { queryData } from '@/api'
import PageHeader from '@/components/PageHeader.vue'
import { QueryForm } from '@/components/query-form'
import type { QueryFormField, QueryFormModel } from '@/components/query-form'
import type { QueryFilters, QueryPriority, QueryRow, QueryStatus } from '@/types'

type ColumnKey = keyof QueryRow
type ColumnFixed = '' | 'left' | 'right'
interface ColumnSetting { key: ColumnKey; label: string; width: number; visible: boolean; required?: boolean; filterable?: boolean; fixed: ColumnFixed }
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
const density = ref<ComponentSize>('default')
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
  { key: 'orderNo', label: '工单号', width: 150, visible: true, required: true, filterable: true, fixed: 'left' },
  { key: 'title', label: '任务标题', width: 190, visible: true, filterable: true, fixed: '' },
  { key: 'requestId', label: '请求 ID', width: 220, visible: true, filterable: true, fixed: '' },
  { key: 'category', label: '类型', width: 120, visible: true, fixed: '' },
  { key: 'applicant', label: '申请人', width: 110, visible: true, filterable: true, fixed: '' },
  { key: 'department', label: '部门', width: 130, visible: true, filterable: true, fixed: '' },
  { key: 'status', label: '状态', width: 110, visible: true, fixed: '' },
  { key: 'priority', label: '优先级', width: 100, visible: true, fixed: '' },
  { key: 'processor', label: '处理人', width: 110, visible: true, filterable: true, fixed: '' },
  { key: 'updatedAt', label: '更新时间', width: 165, visible: true, fixed: '' },
  { key: 'description', label: '任务说明', width: 260, visible: false, filterable: true, fixed: '' },
  { key: 'remark', label: '备注', width: 260, visible: false, filterable: true, fixed: '' },
  { key: 'source', label: '来源', width: 100, visible: false, fixed: '' },
  { key: 'duration', label: '耗时', width: 100, visible: false, fixed: '' }
]
const columns = ref(defaultColumns.map((item) => ({ ...item })))
const visibleColumns = computed(() => columns.value.filter((item) => item.visible))
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
function onPageSizeChange() { pageCurrent.value = 1; void loadData() }
function setDensity(command: string) { density.value = command as ComponentSize }
function moveColumn(index: number, offset: number) { const target = index + offset; if (target < 0 || target >= columns.value.length) return; const [item] = columns.value.splice(index, 1); if (item) columns.value.splice(target, 0, item) }
function resetColumns() { columns.value = defaultColumns.map((item) => ({ ...item })) }
function fixedLabel(value: ColumnFixed) { return value === 'left' ? '左固定' : value === 'right' ? '右固定' : '不固定' }
function statusType(value: unknown): TagType { return statusMeta[value as QueryStatus]?.type ?? 'info' }
function statusLabel(value: unknown): string { return statusMeta[value as QueryStatus]?.label ?? String(value) }
function priorityType(value: unknown): TagType { return priorityMeta[value as QueryPriority]?.type ?? 'info' }
function priorityLabel(value: unknown): string { return priorityMeta[value as QueryPriority]?.label ?? String(value) }
function categoryLabel(value: unknown): string { return categoryLabels[value as keyof typeof categoryLabels] ?? String(value) }
function onHeaderDragEnd(newWidth: number, _oldWidth: number, column: { property?: string }) { const setting = columns.value.find((item) => item.key === column.property); if (setting) setting.width = newWidth }
function showDetail(row: QueryRow) { activeRow.value = row; detailOpen.value = true }
function onOptionsError() { ElMessage.warning('异步选项加载失败，可再次展开重试') }

function exportCsv() {
  const exportRows = selectedRows.value.length ? selectedRows.value : rows.value
  const exportColumns = visibleColumns.value
  const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const csv = [exportColumns.map((item) => escape(item.label)).join(','), ...exportRows.map((row) => exportColumns.map((item) => escape(row[item.key])).join(','))].join('\r\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `adminx-query-${Date.now()}.csv`; anchor.click(); URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${exportRows.length} 条记录`)
}

onMounted(loadData)
onBeforeUnmount(() => controller?.abort())
</script>
