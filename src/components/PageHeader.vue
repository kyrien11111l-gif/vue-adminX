<template>
  <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div>
      <h1 class="m-0 text-xl font-semibold text-[var(--el-text-color-primary)]">
        {{ title }}
      </h1>
      <p v-if="description" class="mb-0 mt-1 text-sm text-[var(--el-text-color-secondary)]">
        {{ description }}
      </p>
    </div>
    <div class="flex items-center gap-2"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
