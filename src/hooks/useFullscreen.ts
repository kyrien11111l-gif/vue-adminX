import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useFullscreen(target?: () => Element | null) {
  const isFullscreen = ref(false)

  const sync = () => {
    const element = target?.()
    isFullscreen.value = Boolean(
      document.fullscreenElement &&
        (!element || document.fullscreenElement === element)
    )
  }

  onMounted(() => {
    sync()
    document.addEventListener('fullscreenchange', sync)
  })

  onBeforeUnmount(() => document.removeEventListener('fullscreenchange', sync))

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await (target?.() ?? document.documentElement).requestFullscreen()
  }

  return { isFullscreen, toggleFullscreen }
}
