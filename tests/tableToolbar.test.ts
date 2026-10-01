/* eslint-disable vue/one-component-per-file -- local pass-through stubs keep this component test independent from Element Plus popper internals */
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TableToolbar from '@/components/table-toolbar/TableToolbar.vue'
import type { TableColumnSetting } from '@/components/table-toolbar'

const ButtonStub = defineComponent({
  name: 'ElButton',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('button', attrs, slots.default?.())
  }
})
const DropdownStub = defineComponent({
  name: 'ElDropdown',
  emits: ['command'],
  setup(_, { slots }) {
    return () => h('div', [slots.default?.(), slots.dropdown?.()])
  }
})
const PopoverStub = defineComponent({
  name: 'ElPopover',
  setup(_, { slots }) {
    return () => h('div', [slots.reference?.(), slots.default?.()])
  }
})
const PassThroughStub = defineComponent({
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  }
})

const columnSettings: TableColumnSetting[] = [
  { key: 'fixed', label: '固定列', visible: true, fixed: 'left', disabled: true },
  { key: 'first', label: '第一列', visible: true, fixed: '' },
  { key: 'second', label: '第二列', visible: true, fixed: '' }
]

function mountToolbar() {
  return mount(TableToolbar, {
    props: {
      title: '查询结果',
      refreshable: true,
      density: 'default',
      columnSettings
    },
    slots: {
      actions: () => h('span', '批量操作'),
      extra: () => h('span', '共 100 条')
    },
    global: {
      stubs: {
        ElButton: ButtonStub,
        ElDropdown: DropdownStub,
        ElDropdownMenu: PassThroughStub,
        ElDropdownItem: PassThroughStub,
        ElIcon: PassThroughStub,
        ElPopover: PopoverStub,
        ElScrollbar: PassThroughStub,
        ElTooltip: PassThroughStub,
        ElCheckbox: PassThroughStub
      }
    }
  })
}

describe('TableToolbar', () => {
  it('renders title slots and emits toolbar actions', async () => {
    const wrapper = mountToolbar()

    expect(wrapper.text()).toContain('查询结果')
    expect(wrapper.text()).toContain('批量操作')
    expect(wrapper.text()).toContain('共 100 条')

    await wrapper.get('[aria-label="刷新表格"]').trigger('click')
    expect(wrapper.emitted('refresh')).toHaveLength(1)

    wrapper.findComponent(DropdownStub).vm.$emit('command', 'small')
    await nextTick()
    expect(wrapper.emitted('update:density')?.[0]).toEqual(['small'])
  })

  it('groups, reorders, fixes and resets column settings', async () => {
    const wrapper = mountToolbar()

    expect(wrapper.text()).toContain('不固定')
    expect(wrapper.text()).toContain('固定在左侧')

    await wrapper.get('[aria-label="拖动排序第一列"]').trigger('keydown', { key: 'ArrowDown' })
    const reordered = wrapper.emitted('update:column-settings')?.[0]?.[0] as TableColumnSetting[]
    expect(reordered.map((item) => item.key)).toEqual(['fixed', 'second', 'first'])

    await wrapper.get('[aria-label="将第一列固定到右侧"]').trigger('click')
    const fixed = wrapper.emitted('update:column-settings')?.[1]?.[0] as TableColumnSetting[]
    expect(fixed.find((item) => item.key === 'first')?.fixed).toBe('right')

    await wrapper.get('.table-column-settings__header button').trigger('click')
    expect(wrapper.emitted('column-settings-reset')).toHaveLength(1)
  })
})
