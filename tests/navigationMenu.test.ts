/* eslint-disable vue/one-component-per-file -- local stubs keep this component test independent from Element Plus rendering */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { defineComponent, h } from 'vue'
import NavigationMenu from '@/layout/components/NavigationMenu.vue'
import type { MenuItem } from '@/types'

const PassThroughStub = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  }
})

const MenuStub = defineComponent({
  name: 'ElMenu',
  inheritAttrs: false,
  emits: ['select'],
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  }
})

describe('NavigationMenu', () => {
  let wrapper: VueWrapper | undefined
  let pinia: Pinia
  let router: ReturnType<typeof createRouter>

  const menus: MenuItem[] = [
    {
      id: 'system',
      name: '系统管理',
      path: 'system',
      children: [{ id: 'user', name: '用户管理', path: 'user' }]
    }
  ]

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/system/user', component: PassThroughStub },
        { path: '/system/role', component: PassThroughStub }
      ]
    })
    await router.push('/system/user')
    await router.isReady()
  })

  afterEach(() => wrapper?.unmount())

  it('does not navigate redundantly when selecting the current menu item', async () => {
    wrapper = mount(NavigationMenu, {
      props: { menus },
      global: {
        plugins: [pinia, router],
        stubs: {
          ElMenu: MenuStub,
          NavigationItem: PassThroughStub
        }
      }
    })
    const push = vi.spyOn(router, 'push')

    wrapper.findComponent(MenuStub).vm.$emit('select', '/system/user')
    await flushPromises()

    expect(push).not.toHaveBeenCalled()
  })
})
