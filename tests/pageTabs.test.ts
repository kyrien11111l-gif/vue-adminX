/* eslint-disable vue/one-component-per-file -- local stubs keep this component test independent from Element Plus rendering */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { defineComponent, h } from 'vue'
import PageTabs from '@/layout/components/PageTabs.vue'
import { usePermissionStore, useTabsStore } from '@/store'

const PassThroughStub = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  }
})

const DropdownStub = defineComponent({
  name: 'ElDropdown',
  inheritAttrs: false,
  emits: ['command'],
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  }
})

describe('PageTabs', () => {
  let wrapper: VueWrapper | undefined
  let pinia: Pinia
  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/dashboard', component: PassThroughStub },
        { path: '/orders', component: PassThroughStub }
      ]
    })
    await router.push('/dashboard')
    await router.isReady()

    usePermissionStore().homePath = '/dashboard'
    useTabsStore().tabs = [
      { key: '/dashboard', title: '工作台', closable: false },
      { key: '/orders', title: '订单', closable: true }
    ]
  })

  afterEach(() => wrapper?.unmount())

  it('does not navigate redundantly when closing all tabs from the home page', async () => {
    wrapper = mount(PageTabs, {
      global: {
        plugins: [pinia, router],
        stubs: {
          ElButton: PassThroughStub,
          ElDropdown: DropdownStub,
          ElDropdownItem: PassThroughStub,
          ElDropdownMenu: PassThroughStub,
          ElIcon: PassThroughStub,
          ElScrollbar: PassThroughStub,
          ElTooltip: PassThroughStub
        }
      }
    })
    const push = vi.spyOn(router, 'push')

    wrapper.findAllComponents(DropdownStub)[0]?.vm.$emit('command', 'close-all')
    await flushPromises()

    expect(push).not.toHaveBeenCalled()
    expect(useTabsStore().tabs).toEqual([
      { key: '/dashboard', title: '工作台', closable: false }
    ])
  })

  it('does not navigate redundantly when activating the current tab', async () => {
    wrapper = mount(PageTabs, {
      global: {
        plugins: [pinia, router],
        stubs: {
          ElButton: PassThroughStub,
          ElDropdown: DropdownStub,
          ElDropdownItem: PassThroughStub,
          ElDropdownMenu: PassThroughStub,
          ElIcon: PassThroughStub,
          ElScrollbar: PassThroughStub,
          ElTooltip: PassThroughStub
        }
      }
    })
    const push = vi.spyOn(router, 'push')

    await wrapper.find('.page-tab').trigger('click')

    expect(push).not.toHaveBeenCalled()
  })
})
