import type {
  QueryCategory,
  QueryFilters,
  QueryPriority,
  QueryResult,
  QueryRow,
  QuerySource,
  QueryStatus
} from '@/types'

const titles = [
  '华东区域销售数据同步',
  '月度财务报表导出',
  '研发环境权限复核',
  '会员资料数据同步',
  '库存周转率报表导出',
  '外包人员权限复核',
  '供应商档案数据同步',
  '重点客户经营分析报表'
]
const applicants = ['王晓敏', '李晨', '周航', '陈璐', '赵博', '孙怡', '郭洋', '马超']
const departments = ['华东大区', '财务部', '供应链部', '人力资源部']
const processors = ['张敏', '周凯', '陈璐', '赵博', '孙怡']
const categories: QueryCategory[] = ['data-sync', 'report', 'access-review']
const statuses: QueryStatus[] = ['processing', 'completed', 'pending', 'failed']
const priorities: QueryPriority[] = ['high', 'medium', 'low']
const sources: QuerySource[] = ['portal', 'api', 'schedule', 'import']

export const queryRows: QueryRow[] = Array.from({ length: 1000 }, (_, index) => {
  const sequence = index + 1
  const day = String(28 - (index % 20)).padStart(2, '0')
  const title = titles[index % titles.length] ?? '数据处理任务'
  return {
    id: sequence,
    orderNo: `QY-202609-${String(sequence).padStart(3, '0')}`,
    title,
    requestId: `REQ-QY-202609-${String(sequence).padStart(4, '0')}-DATA-SERVICE-AUDIT`,
    description: `${title}需要完成字段映射、权限校验、异常核对与结果回写，并保留完整审计记录。`,
    remark: `请在业务低峰期执行，完成后核对明细与审计日志。这是第 ${sequence} 条模拟记录。`,
    category: categories[index % categories.length] ?? 'data-sync',
    applicant: applicants[index % applicants.length] ?? '王晓敏',
    status: statuses[index % statuses.length] ?? 'pending',
    updatedAt: `2026-09-${day} ${String(8 + (index % 10)).padStart(2, '0')}:20`,
    department: departments[index % departments.length] ?? '华东大区',
    priority: priorities[index % priorities.length] ?? 'medium',
    processor: processors[index % processors.length] ?? '张敏',
    source: sources[index % sources.length] ?? 'portal',
    duration: `${2 + (index % 58)} 分钟`
  }
})

function timestamp(value?: string, endOfDay = false): number | undefined {
  if (!value) return undefined
  const time = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}`).getTime()
  return Number.isNaN(time) ? undefined : time
}

function includes(source: string, filter?: string): boolean {
  return !filter?.trim() || source.toLowerCase().includes(filter.trim().toLowerCase())
}

export function queryRowsByFilters(filters: QueryFilters = {}): QueryResult {
  const keyword = filters.keyword?.trim().toLowerCase()
  const startDate = timestamp(filters.startDate)
  const endDate = timestamp(filters.endDate, true)
  const filtered = queryRows.filter((row) => {
    const updatedAt = new Date(row.updatedAt.replace(' ', 'T')).getTime()
    const keywordMatches =
      !keyword ||
      [row.orderNo, row.title, row.applicant, row.requestId, row.description]
        .some((value) => value.toLowerCase().includes(keyword))
    return (
      keywordMatches &&
      (!filters.category || filters.category === 'all' || row.category === filters.category) &&
      (!filters.status || filters.status === 'all' || row.status === filters.status) &&
      (!filters.priority || filters.priority === 'all' || row.priority === filters.priority) &&
      includes(row.orderNo, filters.orderNo) &&
      includes(row.requestId, filters.requestId) &&
      includes(row.description, filters.description) &&
      includes(row.remark, filters.remark) &&
      includes(row.applicant, filters.applicant) &&
      includes(row.department, filters.department) &&
      includes(row.processor, filters.processor) &&
      includes(row.title, filters.title) &&
      (startDate === undefined || updatedAt >= startDate) &&
      (endDate === undefined || updatedAt <= endDate)
    )
  })

  const pageSize = Math.max(1, filters.pageSize ?? (filtered.length || 1))
  const pageCurrent = Math.max(1, filters.pageCurrent ?? 1)
  const start = (pageCurrent - 1) * pageSize
  return { items: filtered.slice(start, start + pageSize), total: filtered.length }
}
