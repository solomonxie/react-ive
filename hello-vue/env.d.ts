/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  import type { Router } from 'vue-router'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
  export const router: Router | undefined
}
