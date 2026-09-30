<template>
  <div class="flex h-screen bg-[var(--el-bg-color)]">
    <nav
      class="shrink-0 border-r border-r-[var(--el-border-color-light)]"
      :style="{ width: `${layoutStore.twoColumnPrimaryWidth}px` }"
      aria-label="一级导航菜单"
    >
      <BrandLogo compact />
      <el-scrollbar
        class="two-column-primary__scrollbar"
        :style="{ height: `calc(100vh - ${layoutStore.headerHeight}px)` }"
        wrap-class="two-column-primary__scroll-wrap"
      >
        <NavigationMenu
          :menus="menus"
          :active-path="activeTopPath"
          collapsed
          top-level-only
          @navigate="$emit('navigate')"
        />
      </el-scrollbar>
    </nav>
    <SideNavigation
      v-if="secondColumnMenus.length"
      :menus="secondColumnMenus"
      :base-path="secondColumnBasePath"
      :active-path="activePath"
      :open-paths="openPaths"
      :collapsed="collapsed"
      :show-brand="false"
      @navigate="$emit('navigate')"
      @collapse="$emit('collapse')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutStore } from '@/store'
import type { MenuItem } from '@/types'
import { joinMenuPath } from '@/utils/menu'
import BrandLogo from './BrandLogo.vue'
import NavigationMenu from './NavigationMenu.vue'
import SideNavigation from './SideNavigation.vue'

const props = withDefaults(
  defineProps<{
    menus: MenuItem[]
    activeTop?: MenuItem
    activePath?: string
    openPaths?: string[]
    collapsed?: boolean
  }>(),
  { activePath: '', openPaths: () => [], collapsed: false }
)

defineEmits<{ navigate: []; collapse: [] }>()
const layoutStore = useLayoutStore()
const activeTopPath = computed(() =>
  props.activeTop ? joinMenuPath('', props.activeTop.path) : ''
)
const secondColumnHasChildren = computed(() => Boolean(props.activeTop?.children?.length))
const secondColumnMenus = computed(() => {
  if (!props.activeTop) return []
  return secondColumnHasChildren.value
    ? props.activeTop.children ?? []
    : [props.activeTop]
})
const secondColumnBasePath = computed(() =>
  secondColumnHasChildren.value ? activeTopPath.value : ''
)
</script>

<style scoped>
.two-column-primary__scrollbar :deep(.two-column-primary__scroll-wrap) {
  overflow-x: hidden;
}

.two-column-primary__scrollbar :deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}
</style>
