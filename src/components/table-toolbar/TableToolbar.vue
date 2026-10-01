<template>
  <div class="table-toolbar">
    <div class="table-toolbar__main">
      <slot name="title">
        <div v-if="title" class="table-toolbar__title">{{ title }}</div>
      </slot>
      <slot name="actions" />
    </div>

    <div class="table-toolbar__aside">
      <slot name="extra" />
      <el-tooltip v-if="refreshable" content="刷新" placement="top">
        <el-button
          class="table-toolbar__icon"
          text
          circle
          :icon="Refresh"
          aria-label="刷新表格"
          :loading="refreshing"
          @click="emit('refresh')"
        />
      </el-tooltip>

      <el-dropdown v-if="density" trigger="click" placement="bottom-end" @command="setDensity">
        <el-button class="table-toolbar__icon" text circle title="表格密度" aria-label="设置表格密度">
          <svg class="table-toolbar__density-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14M5 20h14M12 7v10m-3-7 3-3 3 3m-6 4 3 3 3-3" />
          </svg>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu class="table-density-menu">
            <el-dropdown-item
              v-for="option in densityOptions"
              :key="option.value"
              :command="option.value"
              :class="{ 'is-density-selected': density === option.value }"
              :aria-current="density === option.value ? 'true' : undefined"
            >
              <span>{{ option.label }}</span>
              <el-icon class="table-density-menu__check"><Check v-if="density === option.value" /></el-icon>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-popover
        v-if="columnSettings?.length"
        placement="bottom-end"
        :width="312"
        trigger="click"
        popper-class="table-column-settings-popper"
      >
        <template #reference>
          <el-button class="table-toolbar__icon" text circle :icon="Setting" title="列设置" aria-label="设置表格列" />
        </template>
        <div class="table-column-settings__header">
          <el-button link type="danger" size="small" @click="emit('column-settings-reset')">重置</el-button>
        </div>
        <el-scrollbar max-height="420px">
          <section v-for="group in groupedColumns" :key="group.fixed || 'none'" class="table-column-settings__group">
            <div class="table-column-settings__group-title">{{ group.label }}</div>
            <div
              v-for="column in group.items"
              :key="column.key"
              class="table-column-settings__item"
              :class="{ 'is-dragging': draggingKey === column.key }"
              draggable="true"
              tabindex="0"
              :aria-label="`拖动排序${column.label}`"
              @dragstart="onColumnDragStart(column.key, $event)"
              @dragover.prevent
              @drop="onColumnDrop(column.key, $event)"
              @dragend="draggingKey = undefined"
              @keydown.up.prevent="moveColumnByOffset(column.key, -1)"
              @keydown.down.prevent="moveColumnByOffset(column.key, 1)"
            >
              <el-icon class="table-column-settings__drag" aria-hidden="true"><Rank /></el-icon>
              <el-checkbox
                :model-value="column.visible"
                :disabled="column.disabled"
                class="table-column-settings__checkbox"
                @change="setColumnVisible(column.key, Boolean($event))"
              >
                <span class="table-column-settings__label">{{ column.label }}</span>
              </el-checkbox>
              <div class="table-column-settings__fixed-actions">
                <template v-if="!column.fixed">
                  <el-tooltip content="固定到左侧" placement="top">
                    <el-button text circle size="small" :aria-label="`将${column.label}固定到左侧`" @click="setColumnFixed(column.key, 'left')">
                      <svg class="table-column-settings__fix-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16m16-8H8m4-4-4 4 4 4" /></svg>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="固定到右侧" placement="top">
                    <el-button text circle size="small" :aria-label="`将${column.label}固定到右侧`" @click="setColumnFixed(column.key, 'right')">
                      <svg class="table-column-settings__fix-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4v16M4 12h12m-4-4 4 4-4 4" /></svg>
                    </el-button>
                  </el-tooltip>
                </template>
                <el-tooltip v-else :content="`取消${fixedLabel(column.fixed)}`" placement="top">
                  <el-button text circle size="small" :aria-label="`取消${fixedLabel(column.fixed)}`" @click="setColumnFixed(column.key, '')">
                    <svg class="table-column-settings__pin" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4 5 5-3 1-4 4 1 5-1 1-4.5-4.5L4 20l-1-1 4.5-4.5L3 10l1-1 5 1 4-4 1-3 1 1Z" /></svg>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
          </section>
        </el-scrollbar>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Rank, Refresh, Setting } from '@element-plus/icons-vue'
import type { TableColumnFixed, TableColumnSetting, TableDensity, TableToolbarProps } from './types'

const props = withDefaults(defineProps<TableToolbarProps>(), {
  title: undefined,
  refreshing: false,
  refreshable: false,
  density: undefined,
  columnSettings: undefined
})

const emit = defineEmits<{
  refresh: []
  'update:density': [value: TableDensity]
  'update:column-settings': [value: TableColumnSetting[]]
  'column-settings-reset': []
}>()

const densityOptions: Array<{ value: TableDensity; label: string }> = [
  { value: 'large', label: '宽松' },
  { value: 'default', label: '默认' },
  { value: 'small', label: '紧凑' }
]
const draggingKey = ref<string>()
const groupedColumns = computed(() => [
  { fixed: '' as const, label: '不固定', items: props.columnSettings?.filter((item) => item.fixed === '') ?? [] },
  { fixed: 'left' as const, label: '固定在左侧', items: props.columnSettings?.filter((item) => item.fixed === 'left') ?? [] },
  { fixed: 'right' as const, label: '固定在右侧', items: props.columnSettings?.filter((item) => item.fixed === 'right') ?? [] }
].filter((group) => group.items.length > 0))

function setDensity(command: string) {
  emit('update:density', command as TableDensity)
}

function updateColumn(key: string, update: Partial<TableColumnSetting>) {
  if (!props.columnSettings) return
  emit('update:column-settings', props.columnSettings.map((item) => item.key === key ? { ...item, ...update } : item))
}

function setColumnVisible(key: string, visible: boolean) {
  updateColumn(key, { visible })
}

function setColumnFixed(key: string, fixed: TableColumnFixed) {
  updateColumn(key, { fixed })
}

function moveColumn(sourceKey: string, targetKey: string) {
  if (!props.columnSettings || sourceKey === targetKey) return
  const sourceIndex = props.columnSettings.findIndex((item) => item.key === sourceKey)
  const targetIndex = props.columnSettings.findIndex((item) => item.key === targetKey)
  const source = props.columnSettings[sourceIndex]
  const target = props.columnSettings[targetIndex]
  if (!source || !target || source.fixed !== target.fixed) return
  const nextColumns = [...props.columnSettings]
  const [moved] = nextColumns.splice(sourceIndex, 1)
  if (!moved) return
  nextColumns.splice(targetIndex, 0, moved)
  emit('update:column-settings', nextColumns)
}

function moveColumnByOffset(key: string, offset: -1 | 1) {
  const current = props.columnSettings?.find((item) => item.key === key)
  if (!current) return
  const group = props.columnSettings?.filter((item) => item.fixed === current.fixed) ?? []
  const index = group.findIndex((item) => item.key === key)
  const target = group[index + offset]
  if (target) moveColumn(key, target.key)
}

function onColumnDragStart(key: string, event: DragEvent) {
  draggingKey.value = key
  event.dataTransfer?.setData('text/plain', key)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onColumnDrop(targetKey: string, event: DragEvent) {
  const sourceKey = draggingKey.value ?? event.dataTransfer?.getData('text/plain')
  if (sourceKey) moveColumn(sourceKey, targetKey)
  draggingKey.value = undefined
}

function fixedLabel(value: TableColumnFixed) {
  return value === 'left' ? '固定在左侧' : value === 'right' ? '固定在右侧' : '不固定'
}
</script>

<style scoped>
.table-toolbar {
  display: flex;
  min-height: 56px;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding: 10px 16px;
}

.table-toolbar__main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.table-toolbar__title {
  overflow: hidden;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-toolbar__aside {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
}

.table-toolbar__icon {
  width: 36px;
  height: 36px;
  font-size: 19px;
}

.table-toolbar__density-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.table-column-settings__header {
  display: flex;
  min-height: 26px;
  align-items: center;
  justify-content: flex-end;
}

.table-column-settings__group:not(:last-child) {
  margin-bottom: 12px;
}

.table-column-settings__group-title {
  margin: 2px 4px 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 20px;
}

.table-column-settings__item {
  display: flex;
  min-height: 34px;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
  border-radius: var(--el-border-radius-base);
  transition: background-color var(--el-transition-duration-fast), opacity var(--el-transition-duration-fast);
}

.table-column-settings__item:hover,
.table-column-settings__item:focus-visible {
  background: var(--el-fill-color-light);
  outline: none;
}

.table-column-settings__item.is-dragging {
  opacity: 0.45;
}

.table-column-settings__drag {
  flex: 0 0 auto;
  color: var(--el-text-color-placeholder);
  cursor: grab;
  font-size: 16px;
}

.table-column-settings__item:active .table-column-settings__drag {
  cursor: grabbing;
}

.table-column-settings__checkbox {
  min-width: 0;
  flex: 1;
  margin-right: 4px;
}

.table-column-settings__label {
  display: inline-block;
  max-width: 132px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}

.table-column-settings__fixed-actions {
  display: flex;
  flex: 0 0 56px;
  justify-content: flex-end;
}

.table-column-settings__fixed-actions .el-button + .el-button {
  margin-left: 0;
}

.table-column-settings__fix-icon {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.table-column-settings__pin {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

:global(.table-density-menu .el-dropdown-menu__item) {
  min-width: 112px;
  justify-content: space-between;
  gap: 20px;
}

:global(.table-density-menu .el-dropdown-menu__item.is-density-selected) {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.table-density-menu__check {
  width: 1em;
}

:global(.table-column-settings-popper.el-popover.el-popper) {
  padding: 10px 12px 12px;
}
</style>
