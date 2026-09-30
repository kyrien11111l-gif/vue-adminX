import type { MenuItem } from '@/types'
import { request } from '@/utils/http'

export function getMenus(signal?: AbortSignal): Promise<MenuItem[]> {
  return request.get<MenuItem[]>('/menus', { signal })
}
