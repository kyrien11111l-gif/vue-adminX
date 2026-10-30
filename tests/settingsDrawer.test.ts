/* eslint-disable vue/one-component-per-file -- local radio stubs keep this component test independent from Element Plus CSS imports */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, inject, provide, type PropType } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import SettingsDrawer from '@/layout/components/SettingsDrawer.vue'
import { useLayoutStore } from '@/store'

type RadioValue = string | number | boolean

interface SegmentedOption {
  label: string
  value: RadioValue
  icon?: unknown
}

interface RadioGroupContext {
  isSelected: (value: RadioValue) => boolean
  select: (value: RadioValue) => void
}

const radioGroupKey = Symbol('settings-drawer-radio-group')

const PassThroughStub = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  }
})

const RadioGroupStub = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean] as PropType<RadioValue>,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    provide<RadioGroupContext>(radioGroupKey, {
      isSelected: (value) => props.modelValue === value,
      select: (value) => {
        emit('update:modelValue', value)
        emit('change', value)
      }
    })

    return () => h('div', attrs, slots.default?.())
  }
})

const RadioStub = defineComponent({
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Boolean] as PropType<RadioValue>,
      default: ''
    }
  },
  setup(props, { attrs, slots }) {
    const group = inject<RadioGroupContext>(radioGroupKey)

    return () =>
      h('label', attrs, [
        h('input', {
          type: 'radio',
          value: String(props.value),
          checked: group?.isSelected(props.value),
          onChange: () => group?.select(props.value)
        }),
        slots.default?.()
      ])
  }
})

const SegmentedStub = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean] as PropType<RadioValue>,
      default: ''
    },
    options: {
      type: Array as PropType<SegmentedOption[]>,
      default: () => []
    },
    disabled: Boolean
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { attrs, emit, slots }) {
    return () =>
      h(
        'div',
        attrs,
        props.options.map((item) =>
          h(
            'button',
            {
              type: 'button',
              disabled: props.disabled,
              'data-value': String(item.value),
              onClick: () => {
                emit('update:modelValue', item.value)
                emit('change', item.value)
              }
            },
            slots.default?.({ item }) ?? item.label
          )
        )
      )
  }
})

const TooltipStub = defineComponent({
  inheritAttrs: false,
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  setup(props, { slots }) {
    return () => h('div', { 'data-tooltip': props.content }, slots.default?.())
  }
})

describe('SettingsDrawer', () => {
  let wrapper: VueWrapper | undefined

  const elementStubs = {
    ElButton: PassThroughStub,
    ElColorPicker: PassThroughStub,
    ElDivider: PassThroughStub,
    ElDrawer: PassThroughStub,
    ElForm: PassThroughStub,
    ElFormItem: PassThroughStub,
    ElInput: PassThroughStub,
    ElRadio: RadioStub,
    ElRadioGroup: RadioGroupStub,
    ElSegmented: SegmentedStub,
    ElSwitch: PassThroughStub,
    ElTooltip: TooltipStub
  }

  beforeEach(() => setActivePinia(createPinia()))

  afterEach(() => wrapper?.unmount())

  it('renders a visual preview for every navigation layout', () => {
    wrapper = mount(SettingsDrawer, {
      props: { modelValue: true },
      global: { stubs: elementStubs },
      attachTo: document.body
    })

    expect(document.body.querySelectorAll('.layout-preview')).toHaveLength(4)
    expect(document.body.querySelector('.layout-preview--mixed')).not.toBeNull()
    expect(document.body.querySelector('.theme-mode-segmented')).not.toBeNull()
    expect(
      Array.from(document.body.querySelectorAll('.layout-preview')).map((element) =>
        element.closest('[data-tooltip]')?.getAttribute('data-tooltip')
      )
    ).toEqual(['侧边导航', '顶部导航', '双列导航', '混合导航'])
    expect(document.body.querySelectorAll('.theme-color-option')).toHaveLength(10)
  })

  it('keeps the navigation choice connected to the layout store', async () => {
    wrapper = mount(SettingsDrawer, {
      props: { modelValue: true },
      global: { stubs: elementStubs },
      attachTo: document.body
    })

    const mixedInput = document.body.querySelector<HTMLInputElement>(
      'input[type="radio"][value="mixed-navigation"]'
    )
    expect(mixedInput).not.toBeNull()

    mixedInput?.click()
    await wrapper.vm.$nextTick()

    expect(useLayoutStore().navigationStyle).toBe('mixed-navigation')
  })

  it('applies a theme color preset', async () => {
    wrapper = mount(SettingsDrawer, {
      props: { modelValue: true },
      global: { stubs: elementStubs },
      attachTo: document.body
    })

    const greenOption = document.body.querySelector<HTMLInputElement>(
      '.theme-color-option input[type="radio"][value="#52c41a"]'
    )
    expect(greenOption).not.toBeNull()

    greenOption?.click()
    await wrapper.vm.$nextTick()

    expect(useLayoutStore().themeColorPrimary).toBe('#52c41a')
  })
})
