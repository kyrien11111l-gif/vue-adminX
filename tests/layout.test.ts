/* eslint-disable vue/one-component-per-file -- local stubs keep this layout test independent from child components */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { defineComponent, h } from 'vue'
import Layout from '@/layout/index.vue'
import { KEEP_ALIVE_MAX } from '@/config/layout'

const PassThroughStub = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h('div', attrs, slots.default?.())
  }
})

const KeepAliveStub = defineComponent({
  name: 'KeepAlive',
  props: {
    max: {
      type: Number,
      default: 0
    }
  },
  setup(props, { slots }) {
    return () => h('div', { 'data-keep-alive-max': props.max }, slots.default?.())
  }
})

const RouterViewStub = defineComponent({
  name: 'RouterView',
  setup(_, { slots }) {
    return () => slots.default?.({ Component: PassThroughStub })
  }
})

describe('Layout', () => {
  let wrapper: VueWrapper | undefined
  let pinia: Pinia
  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: PassThroughStub,
          meta: { title: '工作台', keepAlive: true }
        }
      ]
    })
    await router.push('/dashboard')
    await router.isReady()
  })

  afterEach(() => wrapper?.unmount())

  it('limits the number of cached route instances to ten', () => {
    wrapper = mount(Layout, {
      global: {
        plugins: [pinia, router],
        stubs: {
          ElContainer: PassThroughStub,
          ElMain: PassThroughStub,
          ElScrollbar: PassThroughStub,
          ElWatermark: PassThroughStub,
          HeaderBar: PassThroughStub,
          KeepAlive: KeepAliveStub,
          MobileNavigation: PassThroughStub,
          NavigationMenu: PassThroughStub,
          PageTabs: PassThroughStub,
          RouterView: RouterViewStub,
          SettingsDrawer: PassThroughStub,
          SideNavigation: PassThroughStub,
          TwoColumnNavigation: PassThroughStub
        }
      }
    })

    expect(wrapper.find('[data-keep-alive-max]').attributes('data-keep-alive-max')).toBe(
      String(KEEP_ALIVE_MAX)
    )
  })
})
