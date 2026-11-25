// Lesson 05: env vars, two mechanisms.
//
// 1. import.meta.env.VITE_*  (read from .env files, no config needed)
// 2. `define`: compile-time text replacement, for anything you choose.
//
// In a real app: code often reads `process.env.API_ROOT`,
// `process.env.PUBLIC_URL` and friends (older webpack style). vite.config.ts
// can keep a list of keys and turns each into a `define` entry
// (`process.env.API_ROOT` -> the string value at build time), because Vite
// does not provide `process` in the browser. It can also set
// `define: { "process.env.NODE_ENV": ... }` the same way.
import { defineConfig } from 'vite'

const keys = ['MY_BUILD_LABEL'] as const

const definitions = Object.fromEntries(
  keys.map((key) => [
    `process.env.${key}`,
    process.env[key] === undefined ? 'undefined' : JSON.stringify(process.env[key]),
  ]),
)

export default defineConfig({
  define: definitions,
})
