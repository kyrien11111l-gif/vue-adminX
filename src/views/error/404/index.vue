<template>
  <main class="grid min-h-screen place-items-center bg-[var(--el-bg-color-page)] p-6">
    <el-result icon="error" title="404" sub-title="路由不存在，请检查地址或返回工作台。">
      <template #extra><el-button type="primary" @click="goHome">返回工作台</el-button></template>
    </el-result>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
const router = useRouter()
const authStore = useAuthStore()
function goHome() {
  void router.push(authStore.authenticated ? '/dashboard' : '/login')
}
</script>
