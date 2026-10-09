import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ElementPlus, { ElDatePicker, ElSelect } from 'element-plus'
import QueryForm from '@/components/query-form/QueryForm.vue'

describe('QueryForm', () => {
  it('uses Element Plus row/column layout and supports controlled values', async () => {
    const wrapper = mount(QueryForm, {
      props: {
        modelValue: { keyword: '' },
        initialValues: { keyword: '' },
        fields: [
          { type: 'input', prop: 'keyword', label: '关键词' },
          { type: 'select', prop: 'status', label: '状态', options: [{ label: '启用', value: 'active' }] }
        ]
      },
      global: { plugins: [ElementPlus] }
    })

    expect(wrapper.find('.el-row').exists()).toBe(true)
    expect(wrapper.findAll('.el-col').length).toBeGreaterThanOrEqual(2)
    expect(wrapper.find('.el-form--label-right').exists()).toBe(true)
    expect(wrapper.find('.query-form__actions').classes()).toContain('query-form__actions')
    await wrapper.find('input').setValue('admin')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()

    const updateCount = wrapper.emitted('update:modelValue')?.length
    await wrapper.setProps({ modelValue: { keyword: 'auditor', status: '' } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('auditor')
    expect(wrapper.emitted('update:modelValue')?.length).toBe(updateCount)
  })

  it('owns its expanded state and keeps actions after the visible fields', async () => {
    const wrapper = mount(QueryForm, {
      props: {
        modelValue: { one: '', two: '', three: '', four: '' },
        fields: [
          { type: 'input', prop: 'one', label: '一' },
          { type: 'select', prop: 'two', label: '二' },
          { type: 'date', prop: 'three', label: '三' },
          { type: 'dateRange', prop: 'four', label: '四' }
        ],
        collapsedCount: 3
      },
      global: { plugins: [ElementPlus] }
    })

    expect(wrapper.findAll('.query-form__item')).toHaveLength(3)
    expect(wrapper.find('.query-form__actions').element).toBe(
      wrapper.find('.el-row').element.lastElementChild
    )

    await wrapper.get('button[aria-expanded="false"]').trigger('click')

    expect(wrapper.findAll('.query-form__item')).toHaveLength(4)
    expect(wrapper.emitted('expanded-change')?.at(-1)).toEqual([true])
    expect(wrapper.emitted('update:expanded')).toBeUndefined()
  })

  it('passes select options and loading state to Element Plus', () => {
    const wrapper = mount(QueryForm, {
      props: {
        modelValue: { category: '' },
        fields: [{
          type: 'select',
          prop: 'category',
          label: '业务类型',
          options: [{ label: '报表导出', value: 'report' }],
          props: { loading: true }
        }]
      },
      global: { plugins: [ElementPlus] }
    })

    const select = wrapper.findComponent(ElSelect)
    expect(select.props('loading')).toBe(true)
    expect(select.findAllComponents({ name: 'ElOption' })).toHaveLength(1)
  })

  it('supports datetime range fields', () => {
    const wrapper = mount(QueryForm, {
      props: {
        modelValue: { updatedAt: [] },
        fields: [{ type: 'dateTimeRange', prop: 'updatedAt', label: '更新时间' }]
      },
      global: { plugins: [ElementPlus] }
    })

    const datePicker = wrapper.findComponent(ElDatePicker)
    expect(datePicker.props('type')).toBe('datetimerange')
    expect(datePicker.props('valueFormat')).toBe('YYYY-MM-DD HH:mm:ss')
    expect(datePicker.props('startPlaceholder')).toBe('开始时间')
    expect(datePicker.props('endPlaceholder')).toBe('结束时间')
  })
})
