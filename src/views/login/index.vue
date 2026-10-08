<template>
  <main class="grid min-h-screen bg-[var(--el-bg-color-page)] lg:grid-cols-[1.2fr_1fr]">
    <section class="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div class="absolute inset-0 opacity-50 login-grid" aria-hidden="true" />
      <div class="relative flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-[var(--el-color-primary)] font-bold">AX</span>
        <span class="text-xl font-semibold">AdminX</span>
      </div>
      <div class="relative max-w-xl">
        <p class="mb-3 text-sm font-medium tracking-[0.2em] text-blue-300">VUE 3 ADMIN CONSOLE</p>
        <h1 class="m-0 text-4xl font-semibold leading-tight">让系统管理更清晰、更可靠</h1>
        <p class="mt-5 text-base leading-7 text-slate-300">统一的权限路由、四种导航布局与可审计的数据查询体验。</p>
      </div>
      <p class="relative m-0 text-sm text-slate-400">Vue 3 · Element Plus · TypeScript</p>
    </section>

    <section class="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-[420px]">
        <div class="mb-8 lg:hidden">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-[var(--el-color-primary)] font-bold text-white">AX</span>
        </div>
        <h2 class="m-0 text-3xl font-semibold text-[var(--el-text-color-primary)]">欢迎登录</h2>
        <p class="mb-7 mt-2 text-sm text-[var(--el-text-color-secondary)]">登录 AdminX 管理控制台</p>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent="submit">
          <el-form-item label="账号" prop="username">
            <el-input v-model="form.username" :prefix-icon="User" autocomplete="username" placeholder="请输入账号" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" :prefix-icon="Lock" autocomplete="current-password" placeholder="请输入密码" show-password type="password" @keyup.enter="submit" />
          </el-form-item>
          <el-button class="mt-2 w-full" native-type="submit" type="primary" :loading="loading">登录</el-button>
        </el-form>

        <el-alert class="mt-6" title="演示账号" type="info" :closable="false" show-icon>
          <p class="my-1">管理员：admin / 123456</p>
          <p class="my-1">审计员：auditor / 123456</p>
        </el-alert>
        <div class="mt-5 text-center"><router-link class="text-sm text-[var(--el-color-primary)]" to="/whiteList">访问白名单页面</router-link></div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api'
import { useAuthStore } from '@/store'
import { getSafeRedirectTarget } from '@/utils/navigation'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ username: 'admin', password: '123456' })
const rules: FormRules<typeof form> = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

async function submit() {
  if (!(await formRef.value?.validate().catch(() => false))) return
  loading.value = true
  try {
    const result = await login(form)
    authStore.setToken(result.token)
    ElMessage.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
    await router.replace(getSafeRedirectTarget(redirect, '/'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--el-color-primary) 45%, transparent), transparent 38%);
  background-size: 40px 40px, 40px 40px, 100% 100%;
}
</style>
