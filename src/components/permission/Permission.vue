<template>
  <slot v-if="permissionStore.hasPermission(permission)" />
</template>

<script setup lang="ts">
import { usePermissionStore } from '@/store'
import type { PermissionValue } from '@/types'

defineProps<{ permission: PermissionValue }>()
const permissionStore = usePermissionStore()
</script>
