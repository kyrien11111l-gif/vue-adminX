<template>
  <el-scrollbar class="min-w-0 flex-1" wrap-class="top-primary__wrap">
    <div
      class="flex items-center gap-1 px-2"
      :style="{ height: `${layoutStore.headerHeight}px` }"
    >
      <el-button
        v-for="menu in menus"
        :key="menu.id"
        text
        :type="menu.id === activeTop?.id ? 'primary' : 'default'"
        @click="select(menu)"
      >
        <el-icon><component :is="resolveMenuIcon(menu.meta?.icon)" /></el-icon>
        <span class="ml-1">{{ menu.meta?.title ?? menu.name }}</span>
      </el-button>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { resolveMenuIcon } from '@/config/menuIcons'
import { useLayoutStore } from '@/store'
import type { MenuItem } from '@/types'
import { findFirstLeafPath, resolveMenuUrl } from '@/utils/menu'

defineProps<{ menus: MenuItem[]; activeTop?: MenuItem }>()
const router = useRouter()
const layoutStore = useLayoutStore()

function select(menu: MenuItem) {
  const external = resolveMenuUrl(menu.meta?.link)
  if (external) {
    window.open(external, '_blank', 'noopener,noreferrer')
    return
  }
  const target = findFirstLeafPath(menu)
  if (target) void router.push(target)
}
</script>

<style>
.top-primary__wrap {
  overflow-y: hidden;
}
</style>
