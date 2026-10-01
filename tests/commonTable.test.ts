import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import ElementPlus, { ElPagination, ElTable, ElTableColumn } from 'element-plus'
import { describe, expect, it, vi } from 'vitest'
import CommonTable from '@/components/common-table/CommonTable.vue'

describe('CommonTable', () => {
  it('uses the bordered table and default pagination configuration', async () => {
    const wrapper = mount(CommonTable, {
      props: { data: [{ id: 1, name: 'Admin' }], pagination: { total: 41 } },
      slots: { default: () => h(ElTableColumn, { prop: 'name', label: '名称' }) },
      global: { plugins: [ElementPlus] }
    })

    const tableProps = wrapper.findComponent(ElTable).props() as {
      border?: boolean
      fit?: boolean
      showHeader?: boolean
    }
    const paginationProps = wrapper.findComponent(ElPagination).props() as {
      pageSize?: number
      currentPage?: number
      pageSizes?: number[]
      layout?: string
    }
    expect(tableProps.border).toBe(true)
    expect(tableProps.fit).toBe(true)
    expect(tableProps.showHeader).toBe(true)
    expect(wrapper.find('.el-table__header-wrapper').exists()).toBe(true)
    expect(paginationProps.pageSize).toBe(20)
    expect(paginationProps.currentPage).toBe(1)
    expect(paginationProps.pageSizes).toEqual([20, 50, 100])
    expect(paginationProps.layout).toBe('total, sizes, prev, pager, next, jumper')

    wrapper.findComponent(ElPagination).vm.$emit('current-change', 2)
    await nextTick()
    expect((wrapper.findComponent(ElPagination).props() as { currentPage?: number }).currentPage).toBe(2)
    await wrapper.setProps({ pagination: { total: 42 } })
    await nextTick()
    expect((wrapper.findComponent(ElPagination).props() as { currentPage?: number }).currentPage).toBe(2)
  })

  it('supports disabling pagination and forwarding table events', async () => {
    const currentChange = vi.fn()
    const wrapper = mount(CommonTable, {
      props: {
        data: [{ id: 1 }],
        onCurrentChange: currentChange
      },
      global: { plugins: [ElementPlus] }
    })

    wrapper.findComponent(ElTable).vm.$emit('current-change', { id: 1 }, null)
    expect(currentChange).toHaveBeenCalledWith({ id: 1 }, null)

    await wrapper.setProps({ pagination: false })
    await nextTick()
    expect(wrapper.findComponent(ElPagination).exists()).toBe(false)
  })

  it('fills the remaining height while keeping pagination outside the scroll area', async () => {
    const wrapper = mount(CommonTable, {
      props: {
        data: [{ id: 1 }],
        fill: true,
        pagination: { total: 1 }
      },
      global: { plugins: [ElementPlus] }
    })

    expect(wrapper.classes()).toContain('common-table--fill')
    expect(wrapper.find('.common-table__body').exists()).toBe(true)
    expect((wrapper.findComponent(ElTable).props() as { height?: string | number }).height).toBe('100%')
    expect(wrapper.find('.common-table__pagination').exists()).toBe(true)

    await wrapper.setProps({ height: 320 })
    expect((wrapper.findComponent(ElTable).props() as { height?: string | number }).height).toBe(320)
  })

  it('renders configured columns with custom header and cell slots', async () => {
    const wrapper = mount(CommonTable, {
      props: {
        data: [{ id: 1, name: 'Admin', status: 'active' }],
        columns: [
          { key: 'selection', type: 'selection', width: 44 },
          { key: 'name', prop: 'name', label: '名称' },
          { key: 'hidden', prop: 'hidden', label: '隐藏列', visible: false },
          {
            key: 'status',
            prop: 'status',
            label: '状态',
            headerSlot: 'status-header',
            slot: 'status'
          }
        ],
        pagination: false
      },
      slots: {
        'status-header': ({ columnConfig }: { columnConfig: { label?: string } }) =>
          h('span', { class: 'status-header' }, columnConfig.label),
        status: ({ row }: { row: { status: string } }) =>
          h('strong', { class: 'status-cell' }, row.status)
      },
      global: { plugins: [ElementPlus] }
    })

    await nextTick()
    await nextTick()

    expect(wrapper.find('.status-header').text()).toBe('状态')
    expect(wrapper.find('.el-table__body .status-cell').text()).toBe('active')
    expect(wrapper.text()).not.toContain('隐藏列')
    expect(wrapper.findAllComponents(ElTableColumn)).toHaveLength(3)
  })
})
