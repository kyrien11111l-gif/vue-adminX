<template>
  <div
    class="page-tabs box-border flex flex-none overflow-hidden border-y border-y-[var(--el-border-color-lighter)] bg-[var(--el-bg-color)] pr-4"
    :style="{ height: `${layoutStore.pageTabsHeight}px` }"
  >
    <el-scrollbar
      class="min-w-0 flex-1"
      wrap-class="page-tabs__scroll-wrap"
      view-class="page-tabs__scroll-view"
    >
      <el-dropdown
        v-for="(tab, index) in tabsStore.tabs"
        :key="tab.key"
        trigger="contextmenu"
        @command="(command: string) => handleTabMenu(command, tab.key)"
      >
        <div
          class="page-tab"
          :class="{ 'is-active': route.path === tab.key }"
          role="tab"
          :aria-selected="route.path === tab.key"
          :tabindex="route.path === tab.key ? 0 : -1"
          @click="router.push(tab.key)"
          @keydown.enter.prevent="router.push(tab.key)"
          @keydown.space.prevent="router.push(tab.key)"
        >
          <span>{{ tab.title }}</span>
          <button
            v-if="tab.closable"
            class="page-tab__close"
            type="button"
            :aria-label="`关闭${tab.title}`"
            @click.stop="closeTab(tab.key)"
          >
            <el-icon :size="12"><Close /></el-icon>
          </button>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="close-current" :disabled="!tab.closable">关闭当前</el-dropdown-item>
            <el-dropdown-item command="close-other" :disabled="!hasClosableOther(tab.key)">关闭其他</el-dropdown-item>
            <el-dropdown-item command="close-right" :disabled="!hasClosableRight(index)">关闭右边</el-dropdown-item>
            <el-dropdown-item command="close-all" :disabled="!tabsStore.hasClosableTabs">关闭全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-scrollbar>

    <div class="page-tabs__actions flex h-full shrink-0 items-stretch">
      <el-tooltip content="刷新当前页">
        <el-button class="page-tabs__action" text :icon="Refresh" aria-label="刷新当前页面" @click="$emit('refresh')" />
      </el-tooltip>
      <el-tooltip :content="layoutStore.contentMaximized ? '退出内容全屏' : '内容全屏'">
        <el-button
          class="page-tabs__action"
          text
          :icon="layoutStore.contentMaximized ? Aim : FullScreen"
          :aria-label="layoutStore.contentMaximized ? '退出内容全屏' : '内容全屏'"
          @click="layoutStore.toggleContentMaximized()"
        />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Aim, Close, FullScreen, Refresh } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutStore, usePermissionStore, useTabsStore } from '@/store'

defineEmits<{ refresh: [] }>()

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const permissionStore = usePermissionStore()
const tabsStore = useTabsStore()

function hasClosableOther(key: string): boolean {
  return tabsStore.tabs.some((tab) => tab.key !== key && tab.closable)
}

function hasClosableRight(index: number): boolean {
  return tabsStore.tabs.slice(index + 1).some((tab) => tab.closable)
}

async function closeTab(key: string) {
  const index = tabsStore.tabs.findIndex((tab) => tab.key === key)
  const fallback = tabsStore.tabs[index - 1] ?? tabsStore.tabs[index + 1]
  const wasActive = route.path === key
  tabsStore.closeTab(key)
  if (wasActive) {
    await router.push(fallback?.key ?? permissionStore.homePath ?? '/403')
  }
}

async function handleTabMenu(command: string, targetKey: string) {
  if (command === 'close-current') {
    await closeTab(targetKey)
    return
  }
  if (command === 'close-other') {
    tabsStore.closeOtherTabs(targetKey)
    if (route.path !== targetKey) await router.push(targetKey)
    return
  }
  if (command === 'close-right') {
    const targetIndex = tabsStore.tabs.findIndex((tab) => tab.key === targetKey)
    const activeIndex = tabsStore.tabs.findIndex((tab) => tab.key === route.path)
    tabsStore.closeRightTabs(targetKey)
    if (activeIndex > targetIndex) await router.push(targetKey)
    return
  }
  if (command === 'close-all') {
    tabsStore.closeAllTabs()
    await router.push(permissionStore.homePath ?? '/403')
  }
}
</script>

<style lang="scss">
.page-tabs {
  .el-scrollbar__wrap.page-tabs__scroll-wrap {
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .page-tabs__scroll-view {
    display: flex;
    width: max-content;
    min-width: 100%;
    height: 100%;
    align-items: stretch;
  }

  .el-scrollbar__bar.is-vertical {
    display: none;
  }

  .el-scrollbar__bar.is-horizontal {
    bottom: 0;
    height: 2px;
  }
}

.page-tab {
  position: relative;
  display: flex;
  height: 100%;
  flex: none;
  cursor: pointer;
  align-items: center;
  box-sizing: border-box;
  padding: 0 16px;
  border-right: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
  white-space: nowrap;
  transition: color 150ms ease, background-color 150ms ease;

  &::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    background: var(--el-color-primary);
    content: '';
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 150ms ease;
  }

  &:hover {
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }

  &.is-active {
    color: var(--el-color-primary);

    &::after {
      transform: scaleX(1);
    }
  }
}

.page-tab__close {
  display: inline-flex;
  width: 24px;
  height: 24px;
  margin-left: 4px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--el-text-color-secondary);
  background: transparent;

  &:hover {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-dark);
  }
}

.page-tabs__action {
  width: 32px;
  min-width: 32px;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  border-left: 1px solid var(--el-border-color-lighter);
  border-radius: 0;
}

.page-tabs__action + .page-tabs__action {
  margin-left: 0;
}
</style>
