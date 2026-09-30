<template>
  <div class="grid place-items-center p-6" :style="contentStyle">
    <el-result icon="info" title="notMatch" sub-title="动态菜单已注册，但没有找到对应的 Vue 页面组件。">
      <template #extra><el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button></template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@/store'

const router = useRouter()
const layoutStore = useLayoutStore()
const contentStyle = computed(() => ({
  minHeight: `calc(100vh - ${layoutStore.headerHeight + layoutStore.pageTabsHeight}px)`
}))
</script>
