// Lesson 08: a plugin is just an object with a name and some hooks.
//
// Three hooks, three jobs:
//  - resolveId + load: invent a module that has no file ("virtual module")
//  - transform: rewrite the source of files Vite is about to serve
//  - configureServer: add dev-server middleware (a fake URL)
//
// In a real app: a vite.config.ts often has a plugin written like the third
// one, that answers a URL such as /version.txt in dev.
// The `react()`, `svgr()` and `nodePolyfills()` plugins you saw are the same
// kind of object, only bigger. Hooks run in plugin order.
import { defineConfig, type Plugin, type ViteDevServer } from 'vite'

const VIRTUAL_ID = 'virtual:build-info'
const RESOLVED_ID = '\0' + VIRTUAL_ID // "\0" marks ids no other plugin should touch

function buildInfoPlugin(): Plugin {
  return {
    name: 'hello-build-info',
    // 1. When someone imports 'virtual:build-info', say "I own that".
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    // 2. When Vite asks for its contents, return source code as a string.
    load(id) {
      if (id === RESOLVED_ID) {
        return `export const builtAt = ${JSON.stringify(new Date().toISOString())}
export const name = "hello-build-info"`
      }
    },
  }
}

function shoutPlugin(): Plugin {
  return {
    name: 'hello-shout',
    // 3. Rewrite code. Here: replace the text __SHOUT("x") with "X" in .ts files.
    transform(code, id) {
      if (!id.endsWith('.ts') || id.includes('node_modules')) return
      if (!code.includes('__SHOUT(')) return
      const replaced = code.replace(/__SHOUT\("([^"]*)"\)/g, (_, text: string) =>
        JSON.stringify(text.toUpperCase()),
      )
      return { code: replaced, map: null }
    },
  }
}

function versionFileDevPlugin(): Plugin {
  return {
    name: 'hello-version-txt',
    // 4. Dev-only: add a route to the dev server.
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/version.txt', (_req, res) => {
        res.setHeader('Content-Type', 'text/plain')
        res.end('dev-build\n')
      })
    },
  }
}

export default defineConfig({
  plugins: [buildInfoPlugin(), shoutPlugin(), versionFileDevPlugin()],
})
