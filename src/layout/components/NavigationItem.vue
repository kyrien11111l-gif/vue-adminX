<template>
  <el-sub-menu v-if="menu.children?.length" :index="fullPath">
    <template #title>
      <el-icon :aria-label="iconOnly ? menuTitle : undefined">
        <component :is="resolveMenuIcon(menu.meta?.icon)" />
      </el-icon>
      <span>{{ menuTitle }}</span>
    </template>
    <NavigationItem
      v-for="child in menu.children"
      :key="child.id"
      :menu="child"
      :parent-path="fullPath"
      :icon-only="iconOnly"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="fullPath">
    <el-icon :aria-label="iconOnly ? menuTitle : undefined">
      <component :is="resolveMenuIcon(menu.meta?.icon)" />
    </el-icon>
    <template #title>
      <span>{{ menuTitle }}</span>
      <el-icon v-if="menu.meta?.link" class="ml-auto"><TopRight /></el-icon>
    </template>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TopRight } from '@element-plus/icons-vue'
import { resolveMenuIcon } from '@/config/menuIcons'
import type { MenuItem } from '@/types'
import { joinMenuPath } from '@/utils/menu'

defineOptions({ name: 'NavigationItem' })

const props = defineProps<{
  menu: MenuItem
  parentPath?: string
  iconOnly?: boolean
}>()

const fullPath = computed(() => joinMenuPath(props.parentPath ?? '', props.menu.path))
const menuTitle = computed(() => props.menu.meta?.title ?? props.menu.name)
</script>
