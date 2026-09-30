import 'vue-router'
import type { AppRouteMeta } from '@/types'

declare module 'vue-router' {
  interface RouteMeta extends AppRouteMeta {
    public?: boolean
    menuId?: string
    breadcrumbs?: string[]
  }
}
