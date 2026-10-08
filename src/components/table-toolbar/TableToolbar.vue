<template>
  <div class="flex min-h-14 w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
    <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
      <slot name="title">
        <div v-if="title" class="truncate font-medium">{{ title }}</div>
      </slot>
      <slot name="actions" />
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <slot name="extra" />
      <el-tooltip v-if="refreshable" content="刷新" placement="top">
        <el-button
          class="!size-9 !text-[19px]"
          text
          circle
          :icon="Refresh"
          aria-label="刷新表格"
          :loading="refreshing"
          @click="emit('refresh')"
        />
      </el-tooltip>

      <el-dropdown v-if="density" trigger="click" placement="bottom-end" @command="setDensity">
        <el-button class="!size-9 !text-[19px]" text circle title="表格密度" aria-label="设置表格密度">
          <svg class="size-5 fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.8]" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 4h14M5 20h14M12 7v10m-3-7 3-3 3 3m-6 4 3 3 3-3" />
          </svg>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="option in densityOptions"
              :key="option.value"
              :command="option.value"
              :class="[
                '!min-w-28 !justify-between !gap-5',
                density === option.value && '!bg-[var(--el-color-primary-light-9)] !text-[var(--el-color-primary)]'
              ]"
              :aria-current="density === option.value ? 'true' : undefined"
            >
              <span>{{ option.label }}</span>
              <el-icon class="w-[1em]"><Check v-if="density === option.value" /></el-icon>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-popover
        v-if="columnSettings?.length"
        placement="bottom-end"
        :width="312"
        trigger="click"
        popper-class="!pt-2.5 !pr-3 !pb-3 !pl-3"
      >
        <template #reference>
          <el-button class="!size-9 !text-[19px]" text circle :icon="Setting" title="列设置" aria-label="设置表格列" />
        </template>
        <div class="flex min-h-[26px] items-center justify-end">
          <el-button link type="danger" size="small" @click="emit('column-settings-reset')">重置</el-button>
        </div>
        <el-scrollbar max-height="420px">
          <section v-for="group in groupedColumns" :key="group.fixed || 'none'" class="mb-3 last:mb-0">
            <div class="mx-1 mt-0.5 mb-1 text-xs leading-5 text-[var(--el-text-color-secondary)]">{{ group.label }}</div>
            <div
              v-for="column in group.items"
              :key="column.key"
              class="group flex min-h-[34px] items-center gap-1 rounded-[var(--el-border-radius-base)] px-1 transition-[background-color,opacity] duration-[var(--el-transition-duration-fast)] hover:bg-[var(--el-fill-color-light)] focus-visible:bg-[var(--el-fill-color-light)] focus-visible:outline-none"
              :class="{ 'opacity-[0.45]': draggingKey === column.key }"
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
              <el-icon class="group-active:cursor-grabbing shrink-0 cursor-grab text-base text-[var(--el-text-color-placeholder)]" aria-hidden="true"><Rank /></el-icon>
              <el-checkbox
                :model-value="column.visible !== false"
                :disabled="column.disabled"
                class="mr-1 min-w-0 flex-1"
                @change="setColumnVisible(column.key, Boolean($event))"
              >
                <span class="inline-block max-w-[132px] truncate align-bottom">{{ column.label }}</span>
              </el-checkbox>
              <div class="flex w-14 shrink-0 justify-end">
                <template v-if="!(column.fixed ?? '')">
                  <el-tooltip content="固定到左侧" placement="top">
                    <el-button class="!ml-0" text circle size="small" :aria-label="`将${column.label}固定到左侧`" @click="setColumnFixed(column.key, 'left')">
                      <svg class="size-[15px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v16m16-8H8m4-4-4 4 4 4" /></svg>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="固定到右侧" placement="top">
                    <el-button class="!ml-0" text circle size="small" :aria-label="`将${column.label}固定到右侧`" @click="setColumnFixed(column.key, 'right')">
                      <svg class="size-[15px] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.7]" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4v16M4 12h12m-4-4 4 4-4 4" /></svg>
                    </el-button>
                  </el-tooltip>
                </template>
                <el-tooltip v-else :content="`取消${fixedLabel(column.fixed ?? '')}`" placement="top">
                  <el-button class="!ml-0" text circle size="small" :aria-label="`取消${fixedLabel(column.fixed ?? '')}`" @click="setColumnFixed(column.key, '')">
                    <svg class="size-[15px] fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4 5 5-3 1-4 4 1 5-1 1-4.5-4.5L4 20l-1-1 4.5-4.5L3 10l-1-1 5 1 4-4 1-3 1 1Z" /></svg>
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
  { fixed: '' as const, label: '不固定', items: props.columnSettings?.filter((item) => (item.fixed ?? '') === '') ?? [] },
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
  if (!source || !target || (source.fixed ?? '') !== (target.fixed ?? '')) return
  const nextColumns = [...props.columnSettings]
  const [moved] = nextColumns.splice(sourceIndex, 1)
  if (!moved) return
  nextColumns.splice(targetIndex, 0, moved)
  emit('update:column-settings', nextColumns)
}

function moveColumnByOffset(key: string, offset: -1 | 1) {
  const current = props.columnSettings?.find((item) => item.key === key)
  if (!current) return
  const group = props.columnSettings?.filter((item) => (item.fixed ?? '') === (current.fixed ?? '')) ?? []
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
