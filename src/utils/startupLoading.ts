import type { PersistedLayoutState } from '@/types'
import { applyThemeSnapshot } from '@/utils/theme'

const LOADING_ID = 'app-startup-loading'
const STYLE_ID = 'app-startup-loading-style'

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    #${LOADING_ID}{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:var(--app-background,#fff);opacity:1;visibility:visible;transition:opacity .2s ease-out,visibility .2s ease-out}
    #${LOADING_ID}[data-state="hidden"]{opacity:0;visibility:hidden}
    .app-startup-loading__indicator{width:36px;height:36px;border:3px solid color-mix(in srgb,var(--el-color-primary,#409eff) 20%,transparent);border-top-color:var(--el-color-primary,#409eff);border-radius:50%;animation:app-startup-spin .72s linear infinite}
    .app-startup-loading__label{color:var(--el-text-color-secondary,#606266);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
    @keyframes app-startup-spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#${LOADING_ID}{transition:none}.app-startup-loading__indicator{animation-duration:1.5s}}
  `
  document.head.append(style)
}

export function showStartupLoading(
  state: Pick<PersistedLayoutState, 'themeMode' | 'themeColorPrimary'>
): void {
  applyThemeSnapshot(state)
  ensureStyle()
  const existing = document.getElementById(LOADING_ID)
  if (existing) {
    existing.dataset.state = 'visible'
    return
  }

  const element = document.createElement('div')
  element.id = LOADING_ID
  element.dataset.state = 'visible'
  element.setAttribute('role', 'status')
  element.setAttribute('aria-live', 'polite')
  element.innerHTML = `
    <span class="app-startup-loading__indicator" aria-hidden="true"></span>
    <span class="app-startup-loading__label">正在加载中…</span>
  `
  document.body.prepend(element)
}

export function hideStartupLoading(): void {
  const element = document.getElementById(LOADING_ID)
  if (!element || element.dataset.state === 'hidden') return
  element.dataset.state = 'hidden'

  const remove = () => element.remove()
  element.addEventListener('transitionend', remove, { once: true })
  window.setTimeout(remove, 300)
}
