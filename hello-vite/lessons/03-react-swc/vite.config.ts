// Lesson 03: plugins. Vite itself only knows plain JS, TS, CSS and assets.
// Anything else (JSX with Fast Refresh, SVG as components) comes from a plugin.
//
// In a real app: a vite.config.ts often uses exactly these two:
//   react()  from @vitejs/plugin-react-swc
//   svgr({ include: "**/*.svg?react" })  from vite-plugin-svgr
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // Compiles JSX/TSX with SWC (a Rust compiler, fast) and adds React Fast
    // Refresh so edits keep component state. Alternative: @vitejs/plugin-react.
    react(),
    // Lets `import Logo from './logo.svg?react'` give you a React component.
    svgr({ include: '**/*.svg?react' }),
  ],
})
