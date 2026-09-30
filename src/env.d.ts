/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PROXY_URL?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_WATERMARK_ENABLED?: string
  readonly VITE_WATERMARK_CONTENT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
