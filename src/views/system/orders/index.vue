<template>
  <PageContainer>
    <div class="orders-page flex min-h-0 flex-1 flex-col">
      <el-card class="mb-4 shrink-0">
        <QueryForm
          v-model="formValues"
          :fields="filterFields"
          :initial-values="initialValues"
          :loading="loading"
          :collapsed-count="4"
          @submit="applyFilters"
          @reset="applyFilters"
        />
      </el-card>

      <el-card body-class="!p-0 !overflow-hidden flex h-full min-h-0 flex-col" class="min-h-0 flex-1">
        <TableToolbar
          title="订单管理"
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
            <el-tag v-if="selectedOrderIds.length" type="primary">已选择 {{ selectedOrderIds.length }} 项</el-tag>
            <span class="text-xs text-[var(--el-text-color-secondary)]">共 {{ total }} 条</span>
          </template>
        </TableToolbar>

        <CommonTable
          v-loading="loading"
          class="orders-table"
          :data="tableRows"
          :columns="tableColumns"
          :span-method="spanMethod"
          :row-class-name="rowClassName"
          row-key="id"
          border
          :size="density"
          :pagination="pagination"
          :empty-text="loadError || '暂无符合条件的订单'"
          @pagination-current-change="onPageChange"
          @pagination-size-change="onPageSizeChange"
        >
          <template #selection-header>
            <el-checkbox
              :model-value="allSelected"
              :indeterminate="indeterminate"
              aria-label="全选当前页订单"
              @change="toggleSelectAll"
            />
          </template>

          <template #selection="{ row }">
            <el-checkbox
              v-if="row?.rowType === 'meta'"
              :model-value="isSelected(row.order.id)"
              :aria-label="`选择订单${row.order.orderNo}`"
              @change="toggleOrder(row.order.id, $event)"
            />
          </template>

          <template #product="{ row }">
            <div v-if="row.rowType === 'meta'" class="order-meta">
              <div class="order-meta__main">
                <span class="order-store-mark" aria-hidden="true">N</span>
                <el-link type="primary" underline="never" @click="showDetail(row.order)">
                  {{ row.order.orderNo }}
                </el-link>
                <span class="order-meta__divider" aria-hidden="true" />
                <span class="order-meta__label">店铺/站点</span>
                <strong class="order-meta__strong order-ellipsis">{{ row.order.storeSite }}</strong>
                <span class="order-meta__divider" aria-hidden="true" />
                <span class="order-meta__label">订单来源</span>
                <strong class="order-meta__strong">{{ row.order.orderSource }}</strong>
                <span class="order-meta__divider" aria-hidden="true" />
                <span class="order-meta__label">包裹重量</span>
                <strong class="order-meta__strong">{{ row.order.packageWeight }}</strong>
              </div>
            </div>
            <div v-else class="order-cell order-cell--product">
              <div class="order-product__title order-ellipsis" :title="row.order.productName">{{ row.order.productName }}</div>
              <div class="order-line">
                <span class="order-line__label">发货量</span>
                <span class="order-quantity">×{{ row.order.shippedQuantity }}</span>
              </div>
              <div class="order-line">
                <span class="order-line__label">商品单价</span>
                <strong>{{ formatCurrency(row.order.unitPrice) }}</strong>
              </div>
            </div>
          </template>

          <template #order="{ row }">
            <div class="order-cell">
              <div class="order-line">
                <span class="order-line__label">商品 ID</span>
                <span class="order-line__value order-ellipsis">{{ row.order.orderItemId }}</span>
              </div>
              <div class="order-line">
                <span class="order-line__label">SKU</span>
                <span class="order-line__value order-ellipsis">{{ row.order.sku }}</span>
              </div>
              <div class="order-line">
                <span class="order-line__label">可发货</span>
                <span class="order-number-box">{{ row.order.reservedQuantity }}</span>
              </div>
            </div>
          </template>

          <template #profit="{ row }">
            <div class="order-cell">
              <div class="order-line"><span class="order-line__label">订单总额</span><strong class="order-line__value">{{ formatCurrency(row.order.orderAmount) }}</strong></div>
              <div class="order-line"><span class="order-line__label">出库成本</span><span class="order-line__value">{{ formatCurrency(row.order.fulfillmentCost) }}<em>（估）</em></span></div>
              <div class="order-line"><span class="order-line__label">物流运费</span><span class="order-line__value">{{ formatCurrency(row.order.shippingFee) }}<em>（估）</em></span></div>
              <div class="order-line"><span class="order-line__label">毛利润</span><strong class="order-line__value order-profit">{{ formatCurrency(row.order.grossProfit) }}<small>（{{ row.order.grossProfitRate.toFixed(2) }}%）</small></strong></div>
            </div>
          </template>

          <template #time="{ row }">
            <div class="order-cell">
              <div class="order-line"><span class="order-line__label">订购时间</span><span class="order-line__value">{{ row.order.orderTime }}</span></div>
              <div class="order-line"><span class="order-line__label">最晚发货</span><span class="order-line__value">{{ row.order.latestShipTime }}</span></div>
              <div class="order-line"><span class="order-line__label">出库时间</span><span class="order-line__value">{{ row.order.shipTime }}</span></div>
              <div class="order-line"><span class="order-line__label">标发时间</span><span class="order-line__value">{{ row.order.markedTime }}</span></div>
            </div>
          </template>

          <template #recipient="{ row }">
            <div class="order-cell order-cell--recipient">
              <div class="order-line"><span class="order-line__label">收件人</span><strong class="order-line__value">{{ row.order.recipient }}</strong></div>
              <div class="order-line"><span class="order-line__label">收货地址</span><span class="order-line__value order-ellipsis" :title="row.order.address">{{ row.order.address }}</span></div>
              <div class="order-line"><span class="order-line__label">买家邮编</span><span class="order-line__value">{{ row.order.postalCode }}</span></div>
              <div class="order-line"><span class="order-line__label">买家留言</span><span class="order-line__value order-ellipsis" :title="row.order.buyerMessage">{{ row.order.buyerMessage }}</span></div>
            </div>
          </template>

          <template #shipping="{ row }">
            <div class="order-cell">
              <div class="order-line"><span class="order-line__label">物流方式</span><span class="order-line__value order-ellipsis" :title="row.order.shippingMethod">{{ row.order.shippingMethod }}</span></div>
              <div class="order-line"><span class="order-line__label">物流单号</span><span class="order-line__value order-ellipsis" :title="row.order.trackingNo">{{ row.order.trackingNo }}</span></div>
              <div class="order-line"><span class="order-line__label">状态</span><el-tag size="small" :type="statusType(row.order.status)">{{ statusLabel(row.order.status) }}</el-tag></div>
            </div>
          </template>

          <template #operation="{ row }">
            <div v-if="row?.rowType === 'meta'" class="order-operation order-operation--meta">
              <el-tooltip content="加入关注" placement="top">
                <el-button text circle :icon="Operation" :aria-label="`关注订单${row.order.orderNo}`" @click="markOrder(row.order)" />
              </el-tooltip>
              <span class="order-meta__divider" aria-hidden="true" />
              <el-tooltip content="编辑订单" placement="top">
                <el-button text circle :icon="Edit" :aria-label="`编辑订单${row.order.orderNo}`" @click="showDetail(row.order)" />
              </el-tooltip>
            </div>
            <div v-else-if="row?.rowType === 'detail'" class="order-operation">
              <el-button link type="primary" @click="showDetail(row.order)">详情</el-button>
              <el-popover placement="bottom-end" :width="140" trigger="click">
                <div class="order-more-actions">
                  <el-button link type="primary" @click="markOrder(row.order)">加入关注</el-button>
                  <el-button link type="primary" @click="copyOrder(row.order)">复制订单号</el-button>
                  <el-button link type="danger" :disabled="row.order.status === 'cancelled'" @click="cancelOrder(row.order)">取消订单</el-button>
                </div>
                <template #reference>
                  <el-button link type="primary">更多操作<el-icon class="ml-1"><ArrowDown /></el-icon></el-button>
                </template>
              </el-popover>
            </div>
          </template>
        </CommonTable>
      </el-card>

      <el-dialog v-model="detailOpen" title="订单详情" width="min(760px, 92vw)">
        <el-descriptions v-if="activeOrder" :column="2" border>
          <el-descriptions-item label="订单号">{{ activeOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态"><el-tag :type="statusType(activeOrder.status)">{{ statusLabel(activeOrder.status) }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="商品">{{ activeOrder.productName }}</el-descriptions-item>
          <el-descriptions-item label="SKU">{{ activeOrder.sku }}</el-descriptions-item>
          <el-descriptions-item label="收件人">{{ activeOrder.recipient }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ activeOrder.address }} {{ activeOrder.postalCode }}</el-descriptions-item>
          <el-descriptions-item label="订单总额">{{ formatCurrency(activeOrder.orderAmount) }}</el-descriptions-item>
          <el-descriptions-item label="毛利润">{{ formatCurrency(activeOrder.grossProfit) }}</el-descriptions-item>
        </el-descriptions>
        <template #footer><el-button type="primary" @click="detailOpen = false">关闭</el-button></template>
      </el-dialog>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowDown, Edit, Operation } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { TagProps } from 'element-plus'
import { queryOrders } from '@/api'
import { CommonTable } from '@/components/common-table'
import type { CommonTableColumn, CommonTableProps } from '@/components/common-table'
import { PageContainer } from '@/components/page-container'
import { QueryForm } from '@/components/query-form'
import type { QueryFormField, QueryFormModel, QueryOption } from '@/components/query-form'
import { TableToolbar } from '@/components/table-toolbar'
import type { TableColumnSetting } from '@/components/table-toolbar'
import { useTableSettings } from '@/hooks/useTableSettings'
import type { OrderFilters, OrderRow, OrderStatus } from '@/types'

type TagType = TagProps['type']
type OrderColumnKey = 'product' | 'order' | 'profit' | 'time' | 'recipient' | 'shipping' | 'operation'

interface OrderColumnSetting extends TableColumnSetting {
  key: OrderColumnKey
  minWidth: number
  prop?: keyof OrderRow
  slot: string
}

interface OrderTableRow {
  id: string
  rowType: 'meta' | 'detail'
  order: OrderRow
}

type SpanMethodParams = Parameters<NonNullable<CommonTableProps['spanMethod']>>[0]
type RowClassNameGetter = Exclude<NonNullable<CommonTableProps['rowClassName']>, string>
type RowClassNameParams = Parameters<RowClassNameGetter>[0]

const initialValues: QueryFormModel = { keyword: '', store: '', status: '', dateRange: [] }
const formValues = ref<QueryFormModel>({ ...initialValues })
const appliedFilters = ref<OrderFilters>({})
const loading = ref(false)
const loadError = ref('')
const pageCurrent = ref(1)
const pageSize = ref(8)
const pageOrders = ref<OrderRow[]>([])
const total = ref(0)
const selectedOrderIds = ref<number[]>([])
const detailOpen = ref(false)
const activeOrder = ref<OrderRow>()
let controller: AbortController | undefined

const storeOptions: QueryOption[] = [
  { label: 'Minisforum Official Store', value: 'Minisforum Official Store' },
  { label: 'Newegg/[NewEgg...]', value: 'Newegg/[NewEgg...]' },
  { label: 'Minisforum Official', value: 'Minisforum Official' },
  { label: 'Minisforum US', value: 'Minisforum US' }
]
const statusOptions: QueryOption[] = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]
const filterFields: QueryFormField[] = [
  { type: 'input', prop: 'keyword', label: '关键词', props: { placeholder: '订单号、商品、收件人' } },
  { type: 'select', prop: 'store', label: '店铺/站点', props: { placeholder: '全部店铺' }, options: storeOptions },
  { type: 'select', prop: 'status', label: '订单状态', props: { placeholder: '全部状态' }, options: statusOptions },
  { type: 'dateRange', prop: 'dateRange', label: '下单时间', props: { type: 'daterange', valueFormat: 'YYYY-MM-DD' } }
]

const defaultColumns: OrderColumnSetting[] = [
  { key: 'product', prop: 'productName', label: '商品信息', minWidth: 300, slot: 'product' },
  { key: 'order', prop: 'orderItemId', label: '订单信息', minWidth: 220, slot: 'order' },
  { key: 'profit', prop: 'orderAmount', label: '订单利润', minWidth: 245, slot: 'profit' },
  { key: 'time', prop: 'orderTime', label: '时间（北京时间）', minWidth: 275, slot: 'time' },
  { key: 'recipient', prop: 'recipient', label: '收件信息', minWidth: 285, slot: 'recipient' },
  { key: 'shipping', prop: 'trackingNo', label: '物流信息', minWidth: 220, slot: 'shipping' },
  { key: 'operation', label: '操作', minWidth: 138, fixed: 'right', slot: 'operation' }
]
const {
  density,
  columnSettings: columns,
  visibleColumns,
  setDensity,
  setColumnSettings,
  resetColumnSettings
} = useTableSettings({ columns: defaultColumns, widthField: 'minWidth' })

const tableColumns = computed<CommonTableColumn[]>(() => [
  {
    key: 'selection',
    width: 52,
    fixed: 'left',
    align: 'center',
    headerAlign: 'center',
    headerSlot: 'selection-header',
    slot: 'selection'
  },
  ...visibleColumns.value.map((column) => ({ ...column, headerAlign: 'left' }) as CommonTableColumn)
])
const tableRows = computed<OrderTableRow[]>(() => pageOrders.value.flatMap((order) => [
  { id: `${order.id}-meta`, rowType: 'meta', order },
  { id: `${order.id}-detail`, rowType: 'detail', order }
]))
const currentOrderIds = computed(() => pageOrders.value.map((order) => order.id))
const selectedCurrentCount = computed(() => currentOrderIds.value.filter((id) => selectedOrderIds.value.includes(id)).length)
const allSelected = computed(() => currentOrderIds.value.length > 0 && selectedCurrentCount.value === currentOrderIds.value.length)
const indeterminate = computed(() => selectedCurrentCount.value > 0 && !allSelected.value)
const pagination = computed(() => ({
  currentPage: pageCurrent.value,
  pageSize: pageSize.value,
  pageSizes: [8, 16, 32],
  total: total.value,
  layout: 'total, sizes, prev, pager, next, jumper'
}))

const statusMeta: Record<OrderStatus, { label: string; type: TagType }> = {
  pending: { label: '待处理', type: 'warning' },
  processing: { label: '处理中', type: 'primary' },
  shipped: { label: '已发货', type: 'success' },
  completed: { label: '已完成', type: 'info' },
  cancelled: { label: '已取消', type: 'danger' }
}

function normalizeFilters(value: QueryFormModel): OrderFilters {
  const dateRange = Array.isArray(value.dateRange)
    ? value.dateRange.filter((item): item is string => typeof item === 'string')
    : []
  return {
    keyword: typeof value.keyword === 'string' ? value.keyword.trim() : '',
    store: typeof value.store === 'string' ? value.store : '',
    status: typeof value.status === 'string' ? value.status as OrderFilters['status'] : '',
    dateRange
  }
}

function applyFilters(value: QueryFormModel) {
  appliedFilters.value = normalizeFilters(value)
  pageCurrent.value = 1
  selectedOrderIds.value = []
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
    const result = await queryOrders({
      ...appliedFilters.value,
      pageCurrent: pageCurrent.value,
      pageSize: pageSize.value
    }, requestController.signal)
    if (controller !== requestController) return
    pageOrders.value = result.items
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

function isSelected(id: number): boolean {
  return selectedOrderIds.value.includes(id)
}

function toggleOrder(id: number, value: boolean) {
  const next = new Set(selectedOrderIds.value)
  if (value) next.add(id)
  else next.delete(id)
  selectedOrderIds.value = [...next]
}

function toggleSelectAll(value: boolean) {
  const next = new Set(selectedOrderIds.value)
  currentOrderIds.value.forEach((id) => {
    if (value) next.add(id)
    else next.delete(id)
  })
  selectedOrderIds.value = [...next]
}

function spanMethod({ row, columnIndex }: SpanMethodParams) {
  const tableRow = row as unknown as OrderTableRow
  if (tableRow.rowType !== 'meta') return [1, 1]
  const columnCount = tableColumns.value.length
  const operationColumnIndex = columnCount - 1
  const middleColumnCount = columnCount - 2
  if (columnCount < 3 || columnIndex === 0 || columnIndex === operationColumnIndex) return [1, 1]
  if (columnIndex === 1) return [1, middleColumnCount]
  return [0, 0]
}

function rowClassName({ row }: RowClassNameParams): string {
  const tableRow = row as unknown as OrderTableRow
  return tableRow.rowType === 'meta' ? 'orders-table__meta-row' : 'orders-table__detail-row'
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

function statusType(value: OrderStatus): TagType {
  return statusMeta[value]?.type ?? 'info'
}

function statusLabel(value: OrderStatus): string {
  return statusMeta[value]?.label ?? value
}

function showDetail(order: OrderRow) {
  activeOrder.value = order
  detailOpen.value = true
}

function markOrder(order: OrderRow) {
  ElMessage.success(`已关注订单 ${order.orderNo}`)
}

function copyOrder(order: OrderRow) {
  ElMessage.success(`已复制订单号 ${order.orderNo}`)
}

function cancelOrder(order: OrderRow) {
  ElMessage.success(`订单 ${order.orderNo} 已标记为取消`)
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
:deep(.orders-table__meta-row td.el-table__cell) {
  padding: 0;
  background-color: var(--el-fill-color-lighter);
  border-bottom-color: var(--el-border-color-light);
  border-top: 8px solid var(--el-bg-color-page);
}

:deep(.orders-table__detail-row td.el-table__cell) {
  padding: 0;
  vertical-align: top;
}

// :deep(.orders-table__detail-row + .orders-table__meta-row td.el-table__cell) {
//   border-top: 8px solid var(--el-bg-color-page);
// }

.order-meta {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 0 12px;
  color: var(--el-text-color-regular);
}

.order-meta__main {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.order-meta__label {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.order-meta__strong {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  font-weight: 500;
  white-space: nowrap;
}

.order-meta__divider {
  width: 1px;
  height: 18px;
  flex-shrink: 0;
  background-color: var(--el-border-color);
}

.order-store-mark {
  display: inline-flex;
  width: 28px;
  height: 22px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid #f59e0b;
  border-radius: 50%;
  color: #2563eb;
  background: linear-gradient(135deg, #fef3c7 0 42%, #fff 42% 58%, #dbeafe 58%);
  font-size: 12px;
  font-weight: 700;
}

.order-cell {
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 142px;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  padding: 14px 16px;
  color: var(--el-text-color-regular);
  line-height: 1.35;
}

.order-cell--product {
  align-items: flex-start;
}

.order-cell--recipient {
  min-width: 0;
}

.order-product__title {
  max-width: 100%;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
}

.order-line {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: baseline;
  gap: 8px;
}

.order-line__label {
  width: 58px;
  flex: 0 0 58px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.order-line__value {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-quantity {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 12px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
  font-weight: 600;
}

.order-number-box {
  display: inline-flex;
  min-width: 31px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 2px;
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.order-profit {
  color: var(--el-color-success);
}

.order-profit small,
.order-line em {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
}

.order-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.orders-table.el-table .el-table__fixed-left) {
  box-shadow: 6px 0 6px -6px var(--el-border-color);
}

:deep(.orders-table.el-table .el-table__fixed-right) {
  box-shadow: -6px 0 6px -6px var(--el-border-color);
}

.order-operation {
  display: flex;
  min-height: 142px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 10px;
}

.order-operation--meta {
  min-height: 42px;
}

.order-more-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
}

@media (max-width: 900px) {
  .order-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
    padding-block: 8px;
  }

  .order-meta__main {
    width: 100%;
    overflow: hidden;
  }

}
</style>
