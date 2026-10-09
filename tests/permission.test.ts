import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { Permission } from '@/components/permission'
import permissionDirective from '@/directives/permission'
import { usePermissionStore } from '@/store'

function createPermissionStore(permissions: string[]) {
  const pinia = createPinia()
  const store = usePermissionStore(pinia)
  store.permissions = permissions
  return { pinia, store }
}

describe('permission access control', () => {
  it('renders Permission slot only when the user has the required permission', async () => {
    const { pinia, store } = createPermissionStore(['user:create'])
    const wrapper = mount(Permission, {
      props: { permission: 'user:create' },
      slots: { default: '<button>create</button>' },
      global: { plugins: [pinia] }
    })

    expect(wrapper.find('button').exists()).toBe(true)

    store.permissions = []
    await nextTick()
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('hides unauthorized elements without subscribing to permission changes', async () => {
    const { pinia, store } = createPermissionStore([])
    const TestComponent = defineComponent({
      data: () => ({ permission: 'user:edit' }),
      template: '<button v-permission="permission">edit</button>'
    })
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [pinia],
        directives: { permission: permissionDirective }
      }
    })

    expect((wrapper.get('button').element as HTMLButtonElement).style.display).toBe('none')

    store.permissions = ['user:edit']
    await nextTick()
    expect((wrapper.get('button').element as HTMLButtonElement).style.display).toBe('none')
  })
})
