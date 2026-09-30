<template>
  <main class="grid min-h-screen place-items-center bg-[var(--el-bg-color-page)] p-6">
    <el-result icon="success" title="白名单页面" sub-title="无需登录即可访问，且不会触发会话初始化。">
      <template #extra><el-button type="primary" @click="router.push('/login')">返回登录</el-button></template>
    </el-result>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
