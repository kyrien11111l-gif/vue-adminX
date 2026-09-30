import { defineStore } from 'pinia'
import { readStorage, removeStorage, writeStorage } from '@/utils/storage'

export const AUTH_STORAGE_KEY = 'adminx-auth'

interface AuthState {
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => readStorage<AuthState>(AUTH_STORAGE_KEY, { token: null }),
  getters: {
    authenticated: (state) => Boolean(state.token)
  },
  actions: {
    setToken(token: string) {
      this.token = token
      writeStorage(AUTH_STORAGE_KEY, { token })
    },
    clearToken() {
      this.token = null
      removeStorage(AUTH_STORAGE_KEY)
    }
  }
})
