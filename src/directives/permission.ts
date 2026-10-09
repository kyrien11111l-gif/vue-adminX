import type { Directive } from 'vue'
import { usePermissionStore } from '@/store'
import { hasPermission, isPermissionValue } from '@/utils/permission'

function updateVisibility(element: HTMLElement, value: unknown): void {
  const permissionStore = usePermissionStore()
  const allowed = value === undefined ||
    (isPermissionValue(value) && hasPermission(permissionStore.permissions, value))

  if (!allowed) element.style.display = 'none'
}

const permissionDirective: Directive<HTMLElement, unknown> = {
  mounted(element, binding) {
    updateVisibility(element, binding.value)
  },
  updated(element, binding) {
    updateVisibility(element, binding.value)
  }
}

export default permissionDirective
