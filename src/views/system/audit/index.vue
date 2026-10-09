<template>
  <div class="page-shell">
    <el-card shadow="never" body-class="!p-0">
      <el-table :data="records" row-key="id" stripe>
        <el-table-column prop="time" label="时间" min-width="170" />
        <el-table-column prop="operator" label="操作人" min-width="120" />
        <el-table-column prop="action" label="操作" min-width="180" />
        <el-table-column prop="target" label="目标" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP 地址" min-width="140" />
        <el-table-column label="结果" width="100"><template #default="{ row }"><el-tag :type="row.success ? 'success' : 'danger'">{{ row.success ? '成功' : '失败' }}</el-tag></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const records = [
  { id: 1, time: '2026-09-29 10:42:16', operator: 'auditor', action: '导出查询结果', target: '华东区域销售数据同步', ip: '10.18.4.21', success: true },
  { id: 2, time: '2026-09-29 10:18:33', operator: 'admin', action: '调整用户权限', target: '用户 wangxiaomin', ip: '10.18.1.8', success: true },
  { id: 3, time: '2026-09-29 09:55:02', operator: 'auditor', action: '访问角色管理', target: '/system/role', ip: '10.18.4.21', success: false },
  { id: 4, time: '2026-09-29 09:30:48', operator: 'admin', action: '修改主题设置', target: 'navigationStyle', ip: '10.18.1.8', success: true }
]
</script>
