<template>
  <div class="h-full p-4">
    <iframe class="h-full w-full rounded border border-[var(--el-border-color)] bg-white" :src="source" title="嵌入页面" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const source = computed(() => String(route.meta.iframe ?? 'about:blank'))
</script>
