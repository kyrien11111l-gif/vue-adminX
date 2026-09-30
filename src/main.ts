import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'nprogress/nprogress.css'
import '@/styles/tailwind.css'
import '@/styles/index.scss'
import App from '@/App.vue'
import { router } from '@/router'
import { resetSession } from '@/services/session'
import { registerUnauthorizedHandler } from '@/services/unauthorized'
import { useLayoutStore } from '@/store'
import { createLoginUrl } from '@/utils/navigation'
import { hideStartupLoading, showStartupLoading } from '@/utils/startupLoading'

const pinia = createPinia()
const layoutStore = useLayoutStore(pinia)
showStartupLoading(layoutStore.persistedState)

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

registerUnauthorizedHandler(async () => {
  const redirect = router.currentRoute.value.fullPath
  resetSession()
  ElMessage.warning('登录状态已失效，请重新登录')
  await router.replace(createLoginUrl(redirect))
})

try {
  await router.isReady()
  app.mount('#app')
  requestAnimationFrame(() => requestAnimationFrame(hideStartupLoading))
} catch (error) {
  console.error('应用启动失败：', error)
  if (!document.querySelector('#app > *')) app.mount('#app')
  hideStartupLoading()
}
