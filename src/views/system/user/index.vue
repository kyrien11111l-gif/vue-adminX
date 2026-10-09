<template>
  <div class="page-shell">

    <el-card shadow="never" class="mb-4">
      <QueryForm
        v-model="filters"
        :fields="filterFields"
        :initial-values="initialFilters"
        :collapsed-count="3"
        @submit="applyFilters"
        @reset="applyFilters"
      />
    </el-card>

    <el-card shadow="never" body-class="!p-0">
      <div class="flex items-center justify-between border-b border-b-[var(--el-border-color-light)] px-4 py-3">
        <span class="font-medium">用户列表</span>
        <el-button :icon="Refresh" text @click="demo('刷新')">刷新</el-button>
      </div>
      <el-table :data="pageRows" row-key="id" stripe>
        <el-table-column prop="username" label="账号" min-width="130" />
        <el-table-column prop="nickname" label="姓名" min-width="120" />
        <el-table-column prop="department" label="部门" min-width="140" />
        <el-table-column prop="role" label="角色" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" min-width="170" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default><el-button link type="primary" @click="demo('编辑用户')">编辑</el-button><el-button link type="danger" @click="demo('停用用户')">停用</el-button></template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end p-4">
        <el-pagination v-model:current-page="pageCurrent" :page-size="5" layout="total, prev, pager, next" :total="filteredRows.length" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { QueryForm } from '@/components/query-form'
import type { QueryFormField, QueryFormModel } from '@/components/query-form'

interface UserRow {
  id: number
  username: string
  nickname: string
  department: string
  role: string
  status: 'active' | 'disabled'
  lastLogin: string
}

const rows: UserRow[] = [
  { id: 1, username: 'admin', nickname: '系统管理员', department: '平台研发部', role: '超级管理员', status: 'active', lastLogin: '2026-09-29 09:42' },
  { id: 2, username: 'auditor', nickname: '审计员', department: '内控审计部', role: '审计员', status: 'active', lastLogin: '2026-09-29 08:31' },
  { id: 3, username: 'wangxiaomin', nickname: '王晓敏', department: '华东大区', role: '业务用户', status: 'active', lastLogin: '2026-09-28 17:20' },
  { id: 4, username: 'lichen', nickname: '李晨', department: '财务部', role: '报表管理员', status: 'active', lastLogin: '2026-09-28 15:10' },
  { id: 5, username: 'zhouhang', nickname: '周航', department: '供应链部', role: '业务用户', status: 'disabled', lastLogin: '2026-09-22 10:08' },
  { id: 6, username: 'chenlu', nickname: '陈璐', department: '人力资源部', role: '业务用户', status: 'active', lastLogin: '2026-09-27 13:16' },
  { id: 7, username: 'zhaobo', nickname: '赵博', department: '平台研发部', role: '运维管理员', status: 'active', lastLogin: '2026-09-29 07:55' }
]
const initialFilters: QueryFormModel = { keyword: '', department: '', status: '' }
const filters = ref<QueryFormModel>({ ...initialFilters })
const applied = ref<QueryFormModel>({ ...initialFilters })
const pageCurrent = ref(1)
const filterFields: QueryFormField[] = [
  { type: 'input', prop: 'keyword', label: '用户', props: { placeholder: '账号或姓名' } },
  { type: 'select', prop: 'department', label: '部门', props: { placeholder: '全部部门' }, options: [
    { label: '平台研发部', value: '平台研发部' }, { label: '内控审计部', value: '内控审计部' }, { label: '华东大区', value: '华东大区' }, { label: '财务部', value: '财务部' }
  ] },
  { type: 'select', prop: 'status', label: '状态', props: { placeholder: '全部状态' }, options: [
    { label: '启用', value: 'active' }, { label: '停用', value: 'disabled' }
  ] }
]
const filteredRows = computed(() => rows.filter((row) => {
  const keyword = String(applied.value.keyword ?? '').trim().toLowerCase()
  const department = String(applied.value.department ?? '')
  const status = String(applied.value.status ?? '')
  return (!keyword || row.username.includes(keyword) || row.nickname.includes(keyword)) &&
    (!department || row.department === department) && (!status || row.status === status)
}))
const pageRows = computed(() => filteredRows.value.slice((pageCurrent.value - 1) * 5, pageCurrent.value * 5))
function applyFilters(value: QueryFormModel) { applied.value = { ...value }; pageCurrent.value = 1 }
function demo(action: string) { ElMessage.info(`${action}为演示功能，待接入真实业务接口`) }
</script>
