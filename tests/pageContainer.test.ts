import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import PageContainer from '@/components/page-container/PageContainer.vue'
import { useLayoutStore } from '@/store'

describe('PageContainer', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('uses the remaining layout viewport height by default', async () => {
    const wrapper = mount(PageContainer, {
      slots: { default: '页面内容' }
    })
    const layoutStore = useLayoutStore()

    expect(wrapper.attributes('style')).toContain(
      `height: calc(100vh - ${layoutStore.headerHeight + layoutStore.pageTabsHeight}px)`
    )
    expect(wrapper.text()).toBe('页面内容')

    layoutStore.contentMaximized = true
    await wrapper.vm.$nextTick()

    expect(wrapper.attributes('style')).toContain(
      `height: calc(100vh - ${layoutStore.pageTabsHeight}px)`
    )
  })

  it('supports an extra offset and explicit height overrides', async () => {
    const wrapper = mount(PageContainer, {
      props: { offset: 24, minHeight: 320 }
    })
    const layoutStore = useLayoutStore()

    expect(wrapper.attributes('style')).toContain(
      `height: calc(100vh - ${layoutStore.headerHeight + layoutStore.pageTabsHeight + 24}px)`
    )
    expect(wrapper.attributes('style')).toContain('min-height: 320px')

    await wrapper.setProps({ height: '50vh' })
    expect(wrapper.attributes('style')).toContain('height: 50vh')
  })
})
