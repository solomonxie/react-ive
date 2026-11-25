/// <reference types="vite/client" />
// Gives import.meta.env.VITE_* a type. Real apps keep similar typings.
interface ImportMetaEnv {
  readonly VITE_API_NAME: string
  readonly VITE_FEATURE_X: string
}
