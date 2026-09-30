<template>
  <div class="page-shell">
    <PageHeader title="工作台" :description="`欢迎回来，${userStore.displayName}`">
      <el-button type="primary" :icon="Search" @click="router.push('/system/query')">数据查询</el-button>
    </PageHeader>

    <el-row :gutter="16">
      <el-col v-for="item in stats" :key="item.label" :xs="24" :sm="12" :xl="6" class="mb-4">
        <el-card shadow="never">
          <div class="flex items-center justify-between">
            <div>
              <p class="m-0 text-sm text-[var(--el-text-color-secondary)]">{{ item.label }}</p>
              <p class="mb-0 mt-2 text-3xl font-semibold">{{ item.value }}</p>
            </div>
            <el-icon :size="28" :color="item.color"><component :is="item.icon" /></el-icon>
          </div>
          <p class="mb-0 mt-3 text-xs text-[var(--el-text-color-secondary)]">{{ item.note }}</p>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="15" class="mb-4">
        <el-card shadow="never" header="系统健康度">
          <div v-for="health in healthItems" :key="health.label" class="mb-5 last:mb-0">
            <div class="mb-2 flex justify-between text-sm"><span>{{ health.label }}</span><span>{{ health.value }}%</span></div>
            <el-progress :percentage="health.value" :status="health.value < 85 ? 'warning' : 'success'" :stroke-width="10" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="9" class="mb-4">
        <el-card shadow="never" header="最近活动">
          <el-timeline class="px-2">
            <el-timeline-item v-for="activity in activities" :key="activity.time" :timestamp="activity.time" placement="top">
              {{ activity.text }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis, DocumentChecked, Search, UserFilled, WarningFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()
const stats = [
  { label: '今日请求', value: '1,286', note: '较昨日 +12.5%', color: '#409eff', icon: DataAnalysis },
  { label: '待处理', value: '23', note: '其中高优先级 5 条', color: '#e6a23c', icon: WarningFilled },
  { label: '活跃用户', value: '842', note: '过去 30 分钟', color: '#67c23a', icon: UserFilled },
  { label: '本月审计', value: '4,931', note: '覆盖率 99.8%', color: '#909399', icon: DocumentChecked }
]
const healthItems = [
  { label: 'API 可用性', value: 99 },
  { label: '任务成功率', value: 94 },
  { label: '资源余量', value: 78 }
]
const activities = [
  { time: '10:42', text: '审计员完成权限复核' },
  { time: '09:30', text: '财务月报导出任务完成' },
  { time: '08:16', text: '系统菜单配置已同步' }
]
</script>
