<template>
  <el-drawer v-model="visible" direction="ltr" :with-header="false" size="210px" class="mobile-navigation">
    <BrandLogo />
    <el-scrollbar :style="{ height: `calc(100vh - ${layoutStore.headerHeight}px)` }">
      <NavigationMenu
        :menus="menus"
        :active-path="activePath"
        :open-paths="openPaths"
        @navigate="visible = false"
      />
    </el-scrollbar>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLayoutStore } from '@/store'
import type { MenuItem } from '@/types'
import BrandLogo from './BrandLogo.vue'
import NavigationMenu from './NavigationMenu.vue'

const props = withDefaults(defineProps<{ modelValue: boolean; menus: MenuItem[]; activePath?: string; openPaths?: string[] }>(), {
  activePath: '',
  openPaths: () => []
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const layoutStore = useLayoutStore()
const visible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })
</script>

<style>
.mobile-navigation .el-drawer__body {
  padding: 0;
}
</style>
