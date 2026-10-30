<template>
  <el-drawer
    v-model="visible"
    class="settings-drawer"
    header-class="!mb-0 !border-b !border-[var(--el-border-color-light)] !px-5 !pt-5 !pb-4"
    body-class="!overflow-x-hidden !pt-[18px]"
    title="系统设置"
    size="min(280px, 80vw)"
  >
    <el-form label-position="top">
      <el-form-item label="导航布局">
        <el-radio-group
          v-model="layoutStore.navigationStyle"
          class="flex w-full flex-wrap justify-between gap-2.5"
          aria-label="导航布局选项"
          @change="persistNavigation"
        >
          <el-tooltip
            v-for="item in navigationOptions"
            :key="item.value"
            :content="item.label"
            placement="top"
            :trigger="['hover', 'focus']"
            :show-after="120"
          >
            <el-radio
              :value="item.value"
              class="navigation-layout-option !mr-0 h-10 w-12 cursor-pointer focus-within:outline-2 focus-within:outline-[var(--el-color-primary)] focus-within:outline-offset-2"
              :class="{ 'is-active': layoutStore.navigationStyle === item.value }"
              :aria-label="item.label"
            >
              <span
                class="layout-preview relative block h-[38px] w-12 box-border overflow-hidden rounded-[3px] border border-[var(--el-border-color)] bg-[var(--el-fill-color-lighter)] shadow-[var(--el-box-shadow-light)] transition-[border-color,box-shadow,background-color] duration-180 motion-reduce:transition-none"
                :class="[`layout-preview--${item.preview}`, layoutPreviewClasses(item)]"
                aria-hidden="true"
              >
                <span
                  class="layout-preview__header absolute inset-x-0 top-0 hidden h-[9px] bg-[var(--el-text-color-primary)]"
                  :class="{ '!block': item.preview === 'top' || item.preview === 'mixed' }"
                />
                <span
                  class="layout-preview__primary absolute inset-y-0 left-0 hidden bg-[var(--el-text-color-primary)]"
                  :class="layoutPreviewPrimaryClasses(item)"
                />
                <span
                  class="layout-preview__secondary absolute hidden border-r border-[var(--el-border-color)] bg-[var(--el-fill-color-light)]"
                  :class="{
                    'inset-y-0 left-2 !block w-[7px]': item.preview === 'two-column'
                  }"
                />
                <span
                  class="layout-preview__content absolute inset-[2px] block rounded-[1px] bg-[var(--el-fill-color-light)]"
                  :class="layoutPreviewContentClasses(item)"
                />
              </span>
              <span class="sr-only">{{ item.label }}</span>
            </el-radio>
          </el-tooltip>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="主题模式">
        <el-segmented
          :model-value="layoutStore.themeMode"
          class="theme-mode-segmented w-full ![--el-segmented-item-active-bg-color:var(--el-fill-color-dark)] ![--el-segmented-item-hover-bg-color:var(--el-fill-color)] ![--el-segmented-item-selected-bg-color:var(--el-bg-color)] ![--el-segmented-item-selected-color:var(--el-text-color-primary)]"
          :options="themeOptions"
          :disabled="layoutStore.themeTransitioning"
          block
          aria-label="主题模式"
          @pointerdown="rememberThemeTrigger"
          @change="changeTheme"
        >
          <template #default="{ item }">
            <span class="inline-flex items-center justify-center gap-1">
              <el-icon class="text-[15px]" aria-hidden="true">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </span>
          </template>
        </el-segmented>
      </el-form-item>
      <el-form-item label="主题色">
        <div class="flex w-full flex-col gap-3">
          <el-radio-group
            v-model="layoutStore.themeColorPrimary"
            class="!grid w-full !grid-cols-5 justify-items-center gap-1 max-[360px]:!grid-cols-4"
            aria-label="主题色预设"
            @change="changePrimary"
          >
            <el-tooltip
              v-for="item in themeColorOptions"
              :key="item.value"
              :content="item.label"
              placement="top"
              :trigger="['hover', 'focus']"
              :show-after="120"
            >
              <el-radio
                :value="item.value"
                class="theme-color-option !mr-0 !grid !size-9 !box-border min-w-0 cursor-pointer place-items-center rounded-md border border-[var(--el-border-color)] bg-[var(--el-bg-color)] !p-0 transition-[border-color,box-shadow,background-color] duration-180 motion-reduce:transition-none hover:border-[var(--el-color-primary)] hover:bg-[var(--el-fill-color-light)] focus-within:outline-2 focus-within:outline-[var(--el-color-primary)] focus-within:outline-offset-1"
                :class="themeColorClasses(item.value)"
                :aria-label="`选择${item.label}主题色`"
              >
                <span
                  class="theme-color-swatch block h-7 w-7 rounded"
                  :style="{ backgroundColor: item.value }"
                  aria-hidden="true"
                />
              </el-radio>
            </el-tooltip>
          </el-radio-group>
          <div class="flex items-center justify-between gap-3">
            <el-color-picker v-model="layoutStore.themeColorPrimary" @change="changePrimary" />
            <span class="font-mono text-sm">{{ layoutStore.themeColorPrimary }}</span>
          </div>
        </div>
      </el-form-item>
      <el-divider />
      <el-form-item label="页面设置">
        <div class="flex w-full items-center justify-between">
          <span>内容区域最大化</span>
          <el-switch v-model="layoutStore.contentMaximized" />
        </div>
        <div class="mt-4 flex w-full items-center justify-between">
          <span>页面水印</span>
          <el-switch :model-value="layoutStore.watermarkEnabled" @change="setWatermark" />
        </div>
        <el-input
          v-if="layoutStore.watermarkEnabled"
          class="mt-3"
          :model-value="layoutStore.watermarkContent"
          maxlength="24"
          show-word-limit
          @update:model-value="layoutStore.setWatermarkContent"
        />
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Monitor, Moon, Sunny } from '@element-plus/icons-vue'
import type { CheckboxValueType } from 'element-plus'
import type { NavigationStyle, ThemeMode } from '@/types'
import { useLayoutStore } from '@/store'
import { applyThemeSnapshot } from '@/utils/theme'
import { transitionToTheme } from '@/utils/themeTransition'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const layoutStore = useLayoutStore()
const visible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })

type NavigationPreview = 'side' | 'top' | 'two-column' | 'mixed'

const navigationOptions: {
  label: string
  value: NavigationStyle
  preview: NavigationPreview
}[] = [
  { label: '侧边导航', value: 'side-navigation', preview: 'side' },
  { label: '顶部导航', value: 'top-navigation', preview: 'top' },
  { label: '双列导航', value: 'two-column-navigation', preview: 'two-column' },
  { label: '混合导航', value: 'mixed-navigation', preview: 'mixed' }
]
const themeOptions: { label: string; value: ThemeMode; icon: Component }[] = [
  { label: '浅色', value: 'light', icon: Sunny },
  { label: '深色', value: 'dark', icon: Moon },
  { label: '自动', value: 'system', icon: Monitor }
]
const themeColorOptions = [
  { label: '拂晓蓝', value: '#1677ff' },
  { label: '明青', value: '#13c2c2' },
  { label: '极光绿', value: '#52c41a' },
  { label: '青柠色', value: '#a0d911' },
  { label: '金盏花', value: '#faad14' },
  { label: '日暮色', value: '#fa8c16' },
  { label: '火山橙', value: '#fa541c' },
  { label: '日出色', value: '#fadb14' },
  { label: '酱紫', value: '#722ed1' },
  { label: '法式洋红', value: '#eb2f96' }
] as const
type NavigationOption = (typeof navigationOptions)[number]

interface ThemeTransitionTrigger {
  currentTarget: EventTarget | null
  clientX: number
  clientY: number
  detail: number
}

let themeTransitionTrigger: ThemeTransitionTrigger | undefined

function themeColorClasses(value: string) {
  return layoutStore.themeColorPrimary.toLowerCase() === value
    ? '!border-[var(--el-color-primary)] shadow-[0_0_0_1px_var(--el-color-primary)]'
    : ''
}

function layoutPreviewClasses(item: NavigationOption) {
  return layoutStore.navigationStyle === item.value
    ? '!border-[var(--el-color-primary)] shadow-[0_0_0_1px_var(--el-color-primary)]'
    : 'hover:border-[var(--el-color-primary-light-3)]'
}

function layoutPreviewPrimaryClasses(item: NavigationOption) {
  if (item.preview === 'side') return '!block w-[13px]'
  if (item.preview === 'two-column') return '!block w-2'
  if (item.preview === 'mixed') return 'top-[9px] bottom-0 !block w-[11px]'
  return ''
}

function layoutPreviewContentClasses(item: NavigationOption) {
  if (item.preview === 'side') return 'inset-[2px_2px_2px_15px]'
  if (item.preview === 'top') return 'inset-[11px_2px_2px]'
  if (item.preview === 'two-column') return 'inset-[2px_2px_2px_17px]'
  return 'inset-[11px_2px_2px_13px]'
}

function persistNavigation(value: string | number | boolean | undefined) {
  layoutStore.setNavigationStyle(value as NavigationStyle)
}
function rememberThemeTrigger(event: PointerEvent) {
  themeTransitionTrigger = {
    currentTarget: event.currentTarget,
    clientX: event.clientX,
    clientY: event.clientY,
    detail: 1
  }
}
function changeTheme(value: ThemeMode) {
  const event = themeTransitionTrigger
  themeTransitionTrigger = undefined

  if (value === 'system') {
    layoutStore.setThemeMode(value)
    const dark = applyThemeSnapshot(layoutStore.persistedState)
    layoutStore.setDarkMode(dark)
    return
  }
  transitionToTheme(value, event)
}
function changePrimary(value: string | null) {
  if (!value) return
  layoutStore.setThemeColorPrimary(value)
  applyThemeSnapshot(layoutStore.persistedState)
}
function setWatermark(value: CheckboxValueType) {
  layoutStore.setWatermarkEnabled(Boolean(value))
}
</script>

<style scoped>
.navigation-layout-option :deep(.el-radio__input),
.theme-color-option :deep(.el-radio__input) {
  opacity: 0;
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.navigation-layout-option :deep(.el-radio__label) {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  line-height: 1;
}

.theme-color-option :deep(.el-radio__label) {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  padding: 0;
  line-height: 1;
}
</style>
