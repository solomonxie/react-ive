// Lesson 07: production build.
//
// Run: npm run lesson -- 07 build     (vite build, then vite preview)
//
// Dev serves many small files. Build bundles them (Vite 8 uses Rolldown, a
// Rust bundler; before Vite 8 it used Rollup, hence "rollupOptions" in older
// configs) into a few hashed files in dist/, minified.
//
// Things to look at after building:
//  - dist/index.html: the script tag now points at assets/index-<hash>.js
//  - dist/assets/: the dynamic import() became its own chunk, loaded only
//    when you click the button (code splitting)
//  - a .map file, because of `sourcemap`
//
// In a real app: a vite.config.ts often sets
//   build.outDir        -> "build" (not the default "dist")
//   build.sourcemap     -> "hidden" (maps are written, but the JS has no
//                          sourceMappingURL comment, so only error tools use them)
//   build.rolldownOptions.output.strictExecutionOrder -> true, for a library
//                          (brace) that needs imports to run in order
//   base                -> a per-deploy URL prefix, so old tabs still load
//                          old chunks (the "version skew" comment there)
// `vite preview` is how you check a build locally: it serves outDir.
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: 'hidden',
  },
})
