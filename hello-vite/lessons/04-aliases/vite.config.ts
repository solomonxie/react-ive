// Lesson 04: path aliases, so you write '@features/greeting' and not '../../../'.
//
// Two systems must agree:
//  - TypeScript (tsconfig.json "paths") so the editor and `tsc` find the file.
//  - Vite so the browser gets the right file.
// There are two ways to tell Vite:
//  1. resolve.tsconfigPaths: true  (Vite reads the tsconfig "paths" itself)
//  2. resolve.alias                (spelled out here, works for anything)
//
// In a real app: a vite.config.ts often does BOTH. `@features/*` and friends come from
// tsconfig paths (`resolve.tsconfigPaths: true`). Imports of sibling workspace
// packages like `@scope/shared` use regex entries in `resolve.alias`
// to point at that package's src/ folder, so edits show up in dev without
// rebuilding the package.
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Way 1: '@features/*' is defined in ../tsconfig.json
    tsconfigPaths: true,
    // Way 2: an explicit alias. A regex find with a capture group, like
    // a /^@scope\/shared(.*)/ entry for a workspace package.
    alias: [
      {
        find: /^@lib\/(.*)$/,
        replacement: path.resolve(import.meta.dirname, 'src/lib/$1'),
      },
    ],
  },
})
