<template>
  <main class="grid min-h-screen place-items-center bg-[var(--el-bg-color-page)] p-6">
    <el-result icon="error" title="应用初始化失败" :sub-title="permissionStore.error ?? '无法加载当前会话，请稍后重试。'">
      <template #extra>
        <el-button type="primary" :loading="loading" @click="retry">重新加载</el-button>
        <el-button @click="logoutToLogin(router)">退出登录</el-button>
      </template>
    </el-result>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logoutToLogin } from '@/services/session'
import { usePermissionStore } from '@/store'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const loading = ref(false)
async function retry() {
  loading.value = true
  permissionStore.setError(null)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  await router.replace(redirect)
  loading.value = false
}
</script>
