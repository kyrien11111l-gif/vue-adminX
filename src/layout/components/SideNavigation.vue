<template>
  <div
    class="side-navigation flex h-screen w-full min-w-0 flex-1 flex-col overflow-hidden border-r border-r-[var(--el-border-color-light)] bg-[var(--el-bg-color)]"
  >
    <BrandLogo v-if="showBrand" :compact="collapsed" />
    <nav class="min-h-0 flex-1" aria-label="主导航">
      <el-scrollbar class="side-navigation__scrollbar h-full" wrap-class="side-navigation__scroll-wrap">
        <div class="min-w-0 overflow-x-hidden py-2">
          <NavigationMenu
            :menus="menus"
            :base-path="basePath"
            :active-path="activePath"
            :open-paths="openPaths"
            :collapsed="collapsed"
            @navigate="$emit('navigate')"
          />
        </div>
      </el-scrollbar>
    </nav>
    <el-button
      v-if="showCollapse"
      class="sidebar-collapse-button"
      text
      :aria-label="collapsed ? '展开侧边栏' : '收起侧边栏'"
      @click="$emit('collapse')"
    >
      <el-icon><Expand v-if="collapsed" /><Fold v-else /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import type { MenuItem } from '@/types'
import BrandLogo from './BrandLogo.vue'
import NavigationMenu from './NavigationMenu.vue'

withDefaults(
  defineProps<{
    menus: MenuItem[]
    basePath?: string
    activePath?: string
    openPaths?: string[]
    collapsed?: boolean
    showBrand?: boolean
    showCollapse?: boolean
  }>(),
  {
    basePath: '',
    activePath: '',
    openPaths: () => [],
    collapsed: false,
    showBrand: true,
    showCollapse: true
  }
)

defineEmits<{ navigate: []; collapse: [] }>()
</script>

<style scoped lang="scss">
.side-navigation__scrollbar :deep(.side-navigation__scroll-wrap) {
  overflow-x: hidden;
}

.side-navigation__scrollbar :deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.sidebar-collapse-button {
  width: 100%;
  min-height: 48px;
  margin: 0;
  border-top: 1px solid var(--el-border-color-light);
  border-radius: 0;
}
</style>
