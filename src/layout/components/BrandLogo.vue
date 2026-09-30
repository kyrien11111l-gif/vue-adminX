<template>
  <button
    class="flex w-full items-center gap-3 overflow-hidden border-0 bg-transparent px-4 text-left text-[var(--el-text-color-primary)]"
    :style="{ height: `${layoutStore.headerHeight}px` }"
    type="button"
    aria-label="返回工作台"
    @click="router.push('/dashboard')"
  >
    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--el-color-primary)] text-sm font-bold text-white shadow-sm">AX</span>
    <span v-if="!compact" class="whitespace-nowrap text-base font-semibold">AdminX</span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@/store'

defineProps<{ compact?: boolean }>()
const router = useRouter()
const layoutStore = useLayoutStore()
</script>
