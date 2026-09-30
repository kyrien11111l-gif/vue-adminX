<template>
  <el-header
    class="header-bar box-border flex w-full min-w-0 shrink-0 flex-nowrap items-center justify-between bg-[var(--el-bg-color)] px-4"
    :height="`${layoutStore.headerHeight}px`"
  >
    <div class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
      <el-button v-if="mobile" text circle aria-label="打开导航菜单" @click="$emit('menu')">
        <el-icon :size="20"><Menu /></el-icon>
      </el-button>
      <div class="min-w-0 flex-1 overflow-hidden">
        <slot>
          <el-breadcrumb class="hidden min-w-0 min-[992px]:flex" separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="`${index}-${item}`">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </slot>
      </div>
    </div>
    <div class="flex shrink-0 items-center">
      <HeaderActions @settings="$emit('settings')" />
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/store'
import HeaderActions from './HeaderActions.vue'

withDefaults(defineProps<{ mobile?: boolean }>(), { mobile: false })

defineEmits<{ menu: []; settings: [] }>()
const route = useRoute()
const layoutStore = useLayoutStore()
const breadcrumbs = computed(() => {
  const configured = route.meta.breadcrumbs
  if (configured?.length) return configured

  return route.matched
    .flatMap((item) => item.meta.title ? [String(item.meta.title)] : [])
    .filter((title, index, items) => index === 0 || items[index - 1] !== title)
})
</script>

<style scoped>
.header-bar {
  padding-inline: 16px;
}
</style>
