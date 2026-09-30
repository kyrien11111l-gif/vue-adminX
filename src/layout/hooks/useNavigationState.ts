import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/store'
import {
  collectMenuPaths,
  findTopLevelMenu,
  joinMenuPath,
  matchCurrentMenu
} from '@/utils/menu'

export function useNavigationState() {
  const route = useRoute()
  const permissionStore = usePermissionStore()
  const { accessibleMenus } = storeToRefs(permissionStore)

  const entries = computed(() => collectMenuPaths(accessibleMenus.value))
  const currentMenu = computed(() =>
    matchCurrentMenu(route.path, entries.value)
  )
  const selectedKeys = computed(() =>
    currentMenu.value ? [currentMenu.value.key] : []
  )
  const defaultOpenKeys = computed(() => currentMenu.value?.ancestors ?? [])
  const activeTopMenu = computed(() =>
    findTopLevelMenu(route.path, accessibleMenus.value)
  )
  const activeTopPath = computed(() =>
    activeTopMenu.value ? joinMenuPath('', activeTopMenu.value.path) : ''
  )
  const activeSidebarMenus = computed(() => {
    if (!activeTopMenu.value) return []
    return activeTopMenu.value.children?.length
      ? activeTopMenu.value.children
      : [activeTopMenu.value]
  })
  const activeSidebarBasePath = computed(() =>
    activeTopMenu.value?.children?.length ? activeTopPath.value : ''
  )

  return {
    accessibleMenus,
    activeSidebarBasePath,
    activeSidebarMenus,
    activeTopMenu,
    activeTopPath,
    currentMenu,
    defaultOpenKeys,
    entries,
    selectedKeys
  }
}
