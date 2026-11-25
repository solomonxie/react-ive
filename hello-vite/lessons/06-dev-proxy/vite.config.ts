// Lesson 06: the dev proxy.
//
// The page is on http://localhost:5173 and the API on http://localhost:4000.
// Different ports are different origins, so fetching the API directly from the
// page is blocked by CORS. The proxy fixes it: the browser asks Vite
// (same origin) for /api/hello, and Vite's server asks the backend. Server to
// server has no CORS.
//
// The proxy only exists in `vite` (dev) and `vite preview`. A production build
// is just static files, so production needs a real reverse proxy or the API
// must allow the origin.
//
// In a real app: some apps do NOT use server.proxy. They call the API at
// API_ROOT (for example http://localhost:4001/), which vite.config.ts
// passes through `define`, and the API handles CORS. Compare both ways when
// you wonder how the page reaches the API locally.
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      // Anything starting with /api goes to the backend.
      '/api': 'http://localhost:4000',
      // Longer form, with options:
      // '/api': { target: 'http://localhost:4000', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
    },
  },
})
