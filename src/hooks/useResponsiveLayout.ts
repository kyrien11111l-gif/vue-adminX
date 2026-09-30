import { onBeforeUnmount, onMounted, ref } from 'vue'
import { MOBILE_LAYOUT_MEDIA_QUERY } from '@/config/layout'

export function useResponsiveLayout(query = MOBILE_LAYOUT_MEDIA_QUERY) {
  const matches = ref(false)
  let mediaQuery: MediaQueryList | undefined

  const sync = () => {
    matches.value = mediaQuery?.matches ?? false
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    sync()
    mediaQuery.addEventListener('change', sync)
  })

  onBeforeUnmount(() => mediaQuery?.removeEventListener('change', sync))

  return { matches }
}
