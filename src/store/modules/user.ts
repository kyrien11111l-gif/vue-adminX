import { defineStore } from 'pinia'
import type { UserInfo } from '@/types'

interface UserState {
  user: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({ user: null }),
  getters: {
    displayName: (state) => state.user?.nickname ?? '管理员'
  },
  actions: {
    setUser(user: UserInfo) {
      this.user = user
    },
    reset() {
      this.user = null
    }
  }
})
