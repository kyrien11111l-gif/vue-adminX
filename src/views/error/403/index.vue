<template>
  <div class="grid place-items-center p-6" :style="contentStyle">
    <el-result icon="warning" title="403" sub-title="你已登录，但当前角色没有访问该页面的权限。">
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
