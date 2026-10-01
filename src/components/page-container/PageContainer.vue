<template>
  <div class="page-container" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { useLayoutStore } from '@/store'
import type { PageContainerProps } from './types'

const props = withDefaults(defineProps<PageContainerProps>(), {
  offset: 0,
  minHeight: 0
})

const layoutStore = useLayoutStore()

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

const containerStyle = computed<CSSProperties>(() => ({
  height: toCssSize(props.height) ?? defaultHeight.value,
  minHeight: toCssSize(props.minHeight)
}))
</script>

<style scoped>
.page-container {
  box-sizing: border-box;
  display: flex;
  min-width: 0;
  flex-direction: column;
}
</style>
