<template>
  <el-menu
    :default-active="activePath"
    :default-openeds="mode === 'vertical' ? openPaths : []"
    :style="menuStyle"
    :collapse="mode === 'vertical' && collapsed"
    :collapse-transition="false"
    :mode="mode"
    :ellipsis="mode === 'horizontal'"
    unique-opened
    @select="onSelect"
  >
    <NavigationItem
      v-for="menu in displayMenus"
      :key="menu.id"
      :menu="menu"
      :parent-path="basePath"
      :icon-only="mode === 'vertical' && collapsed"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@/store'
import type { MenuItem } from '@/types'
import { findFirstLeafPath, findMenuByPath, resolveMenuUrl } from '@/utils/menu'
import NavigationItem from './NavigationItem.vue'

const props = withDefaults(
  defineProps<{
    menus: MenuItem[]
    basePath?: string
    activePath?: string
    openPaths?: string[]
    collapsed?: boolean
    mode?: 'vertical' | 'horizontal'
    topLevelOnly?: boolean
  }>(),
  {
    basePath: '',
    activePath: '',
    openPaths: () => [],
    collapsed: false,
    mode: 'vertical',
    topLevelOnly: false
  }
)

const emit = defineEmits<{ navigate: [] }>()
const router = useRouter()
const layoutStore = useLayoutStore()
const menuStyle = computed(() =>
  props.mode === 'horizontal'
    ? {
        height: `${layoutStore.headerHeight}px`,
        '--el-menu-horizontal-height': `${layoutStore.headerHeight}px`
      }
    : undefined
)
const displayMenus = computed(() =>
  props.topLevelOnly
    ? props.menus.map((menu) => ({ ...menu, children: undefined }))
    : props.menus
)

function onSelect(path: string) {
  const menu = findMenuByPath(props.menus, path, props.basePath)
  const external = resolveMenuUrl(menu?.meta?.link)
  if (external) window.open(external, '_blank', 'noopener,noreferrer')
  else {
    const target = props.topLevelOnly && menu?.children?.length
      ? findFirstLeafPath(menu)
      : path
    void router.push(target ?? path)
  }
  emit('navigate')
}
</script>

<style scoped lang="scss">
.el-menu {
  border-right: 0;
}

.el-menu--horizontal {
  border-bottom: 0;
  background: transparent;
}

.el-menu--horizontal > :deep(.el-menu-item),
.el-menu--horizontal > :deep(.el-sub-menu .el-sub-menu__title) {
  background: transparent;
}
</style>
