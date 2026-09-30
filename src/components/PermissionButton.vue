<template>
  <slot v-if="permissionStore.hasPermission(permission)" />
</template>

<script setup lang="ts">
import { usePermissionStore } from '@/store'

defineProps<{ permission: string }>()
const permissionStore = usePermissionStore()
</script>
