<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <el-container class="relative h-screen bg-[var(--el-bg-color-page)]">
    <aside
      v-if="hasDesktopSidebar"
      class="fixed inset-y-0 left-0 z-20 overflow-hidden bg-[var(--el-bg-color)] shadow-[var(--el-box-shadow-light)] transition-[width] duration-300 ease-in-out"
      :style="sidebarStyle"
      aria-label="侧边导航区域"
    >
      <SideNavigation
        v-if="layoutStore.navigationStyle === SIDE_NAVIGATION"
        :menus="accessibleMenus"
        :active-path="currentMenu?.key"
        :open-paths="defaultOpenKeys"
        :collapsed="layoutStore.collapsed"
        :content-collapsed="navigationCollapsed"
        @collapse="toggleSidebar"
      />
      <TwoColumnNavigation
        v-else-if="layoutStore.navigationStyle === TWO_COLUMN_NAVIGATION"
        :menus="accessibleMenus"
        :active-top="activeTopMenu"
        :active-path="currentMenu?.key"
        :open-paths="defaultOpenKeys"
        :collapsed="layoutStore.collapsed"
        :content-collapsed="navigationCollapsed"
        @collapse="toggleSidebar"
      />
      <SideNavigation
        v-else-if="layoutStore.navigationStyle === MIXED_NAVIGATION && activeSidebarMenus.length"
        :menus="activeSidebarMenus"
        :base-path="activeSidebarBasePath"
        :active-path="currentMenu?.key"
        :open-paths="defaultOpenKeys"
        :collapsed="layoutStore.collapsed"
        :content-collapsed="navigationCollapsed"
        @collapse="toggleSidebar"
      />
    </aside>

    <el-container
      direction="vertical"
      class="min-w-0 transition-[margin-left] duration-300 ease-in-out motion-reduce:transition-none"
      :style="mainStyle"
    >
      <HeaderBar
        v-if="!isMobile && !layoutStore.contentMaximized && layoutStore.navigationStyle === TOP_NAVIGATION"
        @settings="settingsOpen = true"
      >
        <div class="flex h-full min-w-0 items-center">
          <BrandLogo class="!w-auto shrink-0 !pl-2 !pr-4" />
          <NavigationMenu
            class="h-full min-w-0 flex-1"
            :menus="accessibleMenus"
            :active-path="currentMenu?.key"
            mode="horizontal"
          />
        </div>
      </HeaderBar>

      <HeaderBar
        v-else-if="!isMobile && !layoutStore.contentMaximized && layoutStore.navigationStyle === MIXED_NAVIGATION"
        @settings="settingsOpen = true"
      >
        <NavigationMenu
          class="h-full min-w-0 flex-1"
          :menus="accessibleMenus"
          :active-path="activeTopPath"
          mode="horizontal"
          top-level-only
        />
      </HeaderBar>

      <HeaderBar
        v-else-if="!layoutStore.contentMaximized"
        :mobile="isMobile"
        @menu="layoutStore.setMobileMenuOpen(true)"
        @settings="settingsOpen = true"
      />

      <PageTabs @refresh="refreshKey += 1" />

      <el-main class="relative min-h-0 !p-0">
        <el-scrollbar class="h-full">
          <el-watermark
            class="min-h-full"
            :content="layoutStore.watermarkEnabled ? layoutStore.watermarkContent : ''"
            :font="{ color: layoutStore.darkMode ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)' }"
          >
            <router-view v-slot="{ Component }">
              <transition name="page" mode="out-in">
                <component :is="Component" :key="`${route.fullPath}:${refreshKey}`" />
              </transition>
            </router-view>
          </el-watermark>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>

  <MobileNavigation
    v-if="isMobile"
    :model-value="layoutStore.mobileMenuOpen"
    :menus="accessibleMenus"
    :active-path="currentMenu?.key"
    :open-paths="defaultOpenKeys"
    @update:model-value="layoutStore.setMobileMenuOpen"
  />
  <SettingsDrawer v-model="settingsOpen" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { CSSProperties } from 'vue'
import { useRoute } from 'vue-router'
import {
  MIXED_NAVIGATION,
  SIDE_NAVIGATION,
  TOP_NAVIGATION,
  TWO_COLUMN_NAVIGATION
} from '@/config/layout'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useNavigationState } from '@/layout/hooks/useNavigationState'
import { useLayoutStore, useTabsStore } from '@/store'
import BrandLogo from './components/BrandLogo.vue'
import HeaderBar from './components/HeaderBar.vue'
import MobileNavigation from './components/MobileNavigation.vue'
import NavigationMenu from './components/NavigationMenu.vue'
import PageTabs from './components/PageTabs.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import SideNavigation from './components/SideNavigation.vue'
import TwoColumnNavigation from './components/TwoColumnNavigation.vue'

const route = useRoute()
const layoutStore = useLayoutStore()
const tabsStore = useTabsStore()
const settingsOpen = ref(false)
const refreshKey = ref(0)
const navigationCollapsed = ref(layoutStore.collapsed)
let navigationCollapseTimer: number | undefined
const { matches } = useResponsiveLayout()
const isMobile = computed(() => matches.value)
const {
  accessibleMenus,
  activeSidebarBasePath,
  activeSidebarMenus,
  activeTopMenu,
  activeTopPath,
  currentMenu,
  defaultOpenKeys
} = useNavigationState()

const secondarySidebarWidth = computed(() =>
  layoutStore.collapsed
    ? layoutStore.sidebarCollapsedWidth
    : layoutStore.sidebarWidth
)
const desktopSidebarWidth = computed(() => {
  if (isMobile.value || layoutStore.contentMaximized) return 0
  if (layoutStore.navigationStyle === SIDE_NAVIGATION) {
    return secondarySidebarWidth.value
  }
  if (layoutStore.navigationStyle === MIXED_NAVIGATION) {
    return activeSidebarMenus.value.length ? secondarySidebarWidth.value : 0
  }
  if (layoutStore.navigationStyle === TWO_COLUMN_NAVIGATION) {
    const secondaryWidth = activeTopMenu.value
      ? secondarySidebarWidth.value
      : 0
    return layoutStore.twoColumnPrimaryWidth + secondaryWidth
  }
  return 0
})
const hasDesktopSidebar = computed(() => desktopSidebarWidth.value > 0)
const sidebarStyle = computed<CSSProperties>(() => ({
  width: `${desktopSidebarWidth.value}px`
}))
const mainStyle = computed<CSSProperties>(() => ({
  marginLeft: `${desktopSidebarWidth.value}px`
}))

function toggleSidebar() {
  window.clearTimeout(navigationCollapseTimer)
  layoutStore.toggleCollapsed()

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    navigationCollapsed.value = layoutStore.collapsed
    return
  }

  navigationCollapseTimer = window.setTimeout(() => {
    navigationCollapsed.value = layoutStore.collapsed
    navigationCollapseTimer = undefined
  }, 180)
}

onBeforeUnmount(() => window.clearTimeout(navigationCollapseTimer))

watch(
  () => [route.path, route.meta.title, route.meta.affix] as const,
  () => {
    if (!route.meta.title || route.meta.public) return
    tabsStore.addTab({
      key: route.path,
      title: String(route.meta.title),
      closable: !route.meta.affix
    })
  },
  { immediate: true }
)
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 140ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
