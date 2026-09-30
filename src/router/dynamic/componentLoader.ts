import type { Component } from 'vue'
import IframeView from '@/views/iframe/index.vue'
import NotMatchView from '@/views/error/not-match/index.vue'

interface ViewModule {
  default: Component
}

const modules = import.meta.glob<ViewModule>('/src/views/**/*.vue')

export function hasRouteComponent(component: string): boolean {
  return Boolean(modules[`/src/views/${component}.vue`])
}

export function loadRouteComponent(component?: string, iframe?: string) {
  if (iframe) return IframeView
  if (!component) return NotMatchView
  return modules[`/src/views/${component}.vue`] ?? NotMatchView
}
