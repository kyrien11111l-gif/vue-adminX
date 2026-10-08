<template>
  <div class="header-actions flex shrink-0 items-center gap-[2px]">
    <el-tooltip content="切换明暗主题">
      <el-button
        class="header-action-button"
        text
        :disabled="layoutStore.themeTransitioning"
        :aria-label="layoutStore.darkMode ? '切换到浅色模式' : '切换到深色模式'"
        @click="toggleTheme"
      >
        <el-icon><Sunny v-if="layoutStore.darkMode" /><Moon v-else /></el-icon>
      </el-button>
    </el-tooltip>
    <el-tooltip content="布局设置">
      <el-button class="header-action-button" text aria-label="打开布局设置" @click="$emit('settings')">
        <el-icon><Setting /></el-icon>
      </el-button>
    </el-tooltip>
    <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
      <el-button class="header-action-button" text :aria-label="isFullscreen ? '退出全屏' : '进入全屏'" @click="toggleFullscreen">
        <el-icon><Aim v-if="isFullscreen" /><FullScreen v-else /></el-icon>
      </el-button>
    </el-tooltip>
    <el-dropdown trigger="click" @command="onCommand">
      <button
        class="flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-[var(--el-border-radius-base)] border-0 bg-transparent px-1 hover:bg-[var(--el-fill-color-light)]"
        type="button"
        aria-label="打开用户菜单"
      >
        <el-avatar :size="24">{{ initials }}</el-avatar>
        <span class="hidden max-w-28 truncate text-sm text-[var(--el-text-color-primary)] sm:inline">{{ userStore.user?.nickname }}</span>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item disabled>{{ userStore.user?.roles.join('、') }}</el-dropdown-item>
          <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Aim, FullScreen, Moon, Setting, Sunny } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useRouter } from 'vue-router'
import { useLayoutStore, useUserStore } from '@/store'
import { logoutToLogin } from '@/utils/session'
import { transitionToTheme } from '@/utils/themeTransition'

defineEmits<{ settings: [] }>()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const router = useRouter()
const { isFullscreen, toggleFullscreen } = useFullscreen()
const initials = computed(() => userStore.user?.nickname.slice(0, 1) ?? 'U')

function toggleTheme(event: MouseEvent) {
  transitionToTheme(layoutStore.darkMode ? 'light' : 'dark', event)
}

async function onCommand(command: string) {
  if (command !== 'logout') return
  await ElMessageBox.confirm('确定退出当前账号吗？', '退出登录', {
    type: 'warning',
    confirmButtonText: '退出',
    cancelButtonText: '取消'
  })
  await logoutToLogin(router)
}
</script>

<style scoped>
.header-action-button {
  width: 32px;
  height: 32px;
  margin: 0;
  padding: 0;
}
</style>
