<template>
  <div class="page-shell">
    <PageHeader title="角色管理" description="查看角色覆盖范围与权限配置。"><el-button type="primary" :icon="Plus" @click="demo('新增角色')">新增角色</el-button></PageHeader>
    <el-row :gutter="16" class="mb-4">
      <el-col v-for="stat in stats" :key="stat.label" :xs="24" :sm="8" class="mb-3 sm:mb-0">
        <el-card shadow="never"><p class="m-0 text-sm text-[var(--el-text-color-secondary)]">{{ stat.label }}</p><p class="mb-0 mt-2 text-3xl font-semibold">{{ stat.value }}</p></el-card>
      </el-col>
    </el-row>
    <el-card shadow="never" body-class="!p-0">
      <el-table :data="roles" row-key="id" stripe>
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" min-width="160" />
        <el-table-column prop="members" label="成员数" width="100" />
        <el-table-column prop="scope" label="数据范围" min-width="160" />
        <el-table-column prop="description" label="说明" min-width="260" show-overflow-tooltip />
        <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" fixed="right" width="160"><template #default><el-button link type="primary" @click="demo('配置权限')">配置权限</el-button><el-button link @click="demo('编辑角色')">编辑</el-button></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'

const stats = [{ label: '角色总数', value: 5 }, { label: '已启用', value: 4 }, { label: '覆盖用户', value: 856 }]
const roles = [
  { id: 1, name: '超级管理员', code: 'super_admin', members: 3, scope: '全部数据', description: '系统全部功能和数据权限', enabled: true },
  { id: 2, name: '审计员', code: 'auditor', members: 12, scope: '审计与查询', description: '查询业务数据并访问审计记录', enabled: true },
  { id: 3, name: '报表管理员', code: 'report_manager', members: 18, scope: '本部门', description: '维护本部门报表任务', enabled: true },
  { id: 4, name: '业务用户', code: 'business_user', members: 821, scope: '本人数据', description: '提交与查看本人业务申请', enabled: true },
  { id: 5, name: '临时访客', code: 'temporary_guest', members: 2, scope: '只读', description: '临时只读访问角色', enabled: false }
]
function demo(action: string) { ElMessage.info(`${action}为演示功能，待接入真实业务接口`) }
</script>
