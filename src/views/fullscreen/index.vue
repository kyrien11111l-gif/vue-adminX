<template>
  <main class="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 p-6 text-white">
    <div class="absolute inset-0 fullscreen-glow" aria-hidden="true" />
    <section class="relative max-w-2xl text-center">
      <el-icon :size="56" color="var(--el-color-primary)"><Monitor /></el-icon>
      <h1 class="mb-3 mt-6 text-4xl font-semibold">独立全屏页面</h1>
      <p class="mb-8 text-slate-300">该路由经过登录鉴权，但不渲染后台应用外壳。</p>
      <el-button type="primary" size="large" @click="router.push('/dashboard')">返回工作台</el-button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { Monitor } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.fullscreen-glow {
  background: radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--el-color-primary) 35%, transparent), transparent 42%);
}
</style>
