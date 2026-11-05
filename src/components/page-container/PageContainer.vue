<template>
  <div class="box-border flex min-w-0 flex-col p-4" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { COMPACT_LAYOUT_MEDIA_QUERY } from '@/config/layout'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useLayoutStore } from '@/store'
import type { PageContainerProps } from './types'

const props = withDefaults(defineProps<PageContainerProps>(), {
  offset: 0
})

const layoutStore = useLayoutStore()
const { matches: isCompactViewport } = useResponsiveLayout(COMPACT_LAYOUT_MEDIA_QUERY)

function toCssSize(value: CSSProperties['height']): string | undefined {
  if (typeof value === 'number') return `${value}px`
  return value
}

const defaultHeight = computed(() => {
  const headerHeight = layoutStore.contentMaximized
    ? 0
    : layoutStore.headerHeight
  const occupiedHeight = headerHeight + layoutStore.pageTabsHeight + props.offset
  return `calc(100vh - ${occupiedHeight}px)`
})

const resolvedHeight = computed(() => toCssSize(props.height) ?? defaultHeight.value)

const containerStyle = computed<CSSProperties>(() => {
  const customMinHeight = toCssSize(props.minHeight)
  if (isCompactViewport.value) {
    return { minHeight: customMinHeight ?? resolvedHeight.value }
  }
  return { height: resolvedHeight.value, minHeight: customMinHeight }
})
</script>
