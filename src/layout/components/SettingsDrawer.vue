<template>
  <el-drawer v-model="visible" title="系统设置" size="min(360px, 92vw)">
    <el-form label-position="top">
      <el-form-item label="导航布局">
        <el-radio-group v-model="layoutStore.navigationStyle" class="grid w-full grid-cols-2 gap-2" @change="persistNavigation">
          <el-radio-button v-for="item in navigationOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="主题模式">
        <div class="flex w-full gap-2">
          <el-button
            v-for="item in themeOptions"
            :key="item.value"
            class="!ml-0 min-w-0 flex-1"
            :type="layoutStore.themeMode === item.value ? 'primary' : 'default'"
            :disabled="layoutStore.themeTransitioning"
            :aria-pressed="layoutStore.themeMode === item.value"
            @click="changeTheme(item.value, $event)"
          >
            {{ item.label }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="主题色">
        <div class="flex items-center gap-3">
          <el-color-picker v-model="layoutStore.themeColorPrimary" @change="changePrimary" />
          <span class="font-mono text-sm">{{ layoutStore.themeColorPrimary }}</span>
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
import { computed } from 'vue'
import type { CheckboxValueType } from 'element-plus'
import type { NavigationStyle, ThemeMode } from '@/types'
import { useLayoutStore } from '@/store'
import { applyThemeSnapshot } from '@/utils/theme'
import { transitionToTheme } from '@/utils/themeTransition'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const layoutStore = useLayoutStore()
const visible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })

const navigationOptions: { label: string; value: NavigationStyle }[] = [
  { label: '侧边导航', value: 'side-navigation' },
  { label: '顶部导航', value: 'top-navigation' },
  { label: '双列导航', value: 'two-column-navigation' },
  { label: '混合导航', value: 'mixed-navigation' }
]
const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: '浅色', value: 'light' },
  { label: '暗黑', value: 'dark' },
  { label: '跟随系统', value: 'system' }
]

function persistNavigation(value: string | number | boolean | undefined) {
  layoutStore.setNavigationStyle(value as NavigationStyle)
}
function changeTheme(value: ThemeMode, event: MouseEvent) {
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
