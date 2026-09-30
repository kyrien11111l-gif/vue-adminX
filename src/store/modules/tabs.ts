import { defineStore } from 'pinia'
import type { LayoutTab } from '@/types'
import { readStorage, removeStorage, writeStorage } from '@/utils/storage'

export const TABS_STORAGE_KEY = 'adminx-tabs'

interface TabsState {
  tabs: LayoutTab[]
}

export const useTabsStore = defineStore('tabs', {
  state: (): TabsState =>
    readStorage<TabsState>(TABS_STORAGE_KEY, { tabs: [] }),
  getters: {
    hasClosableTabs: (state) => state.tabs.some((tab) => tab.closable)
  },
  actions: {
    persist() {
      writeStorage(TABS_STORAGE_KEY, { tabs: this.tabs })
    },
    setHomeTab(tab: LayoutTab | null) {
      this.tabs = tab
        ? [tab, ...this.tabs.filter((item) => item.closable && item.key !== tab.key)]
        : []
      this.persist()
    },
    addTab(tab: LayoutTab) {
      const index = this.tabs.findIndex((item) => item.key === tab.key)
      if (index >= 0) this.tabs.splice(index, 1, tab)
      else this.tabs.push(tab)
      this.persist()
    },
    closeTab(key: string) {
      this.tabs = this.tabs.filter((tab) => tab.key !== key || !tab.closable)
      this.persist()
    },
    closeOtherTabs(key: string) {
      this.tabs = this.tabs.filter((tab) => !tab.closable || tab.key === key)
      this.persist()
    },
    closeRightTabs(key: string) {
      const index = this.tabs.findIndex((tab) => tab.key === key)
      if (index < 0) return
      this.tabs = this.tabs.filter(
        (tab, tabIndex) => tabIndex <= index || !tab.closable
      )
      this.persist()
    },
    closeAllTabs() {
      this.tabs = this.tabs.filter((tab) => !tab.closable)
      this.persist()
    },
    reset() {
      this.tabs = []
      removeStorage(TABS_STORAGE_KEY)
    }
  }
})
