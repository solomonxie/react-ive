// npm run lesson -- 05                  dev server for lesson 05
// npm run lesson -- 05 --mode staging   extra args go to vite
// npm run lesson -- 07 build            vite build, then vite preview
//
// Each lesson is a folder under lessons/ with its own index.html (and its own
// vite.config.ts when it needs one). The runner points Vite at that folder.
// If the folder has an api.ts, the runner starts it too (lesson 06).
import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const lessonsDir = resolve(root, 'lessons')
const [lesson = '01', ...rest] = process.argv.slice(2)

const folder = readdirSync(lessonsDir).find((name) => name.startsWith(`${lesson}-`))
if (!folder) {
  console.error(`Unknown lesson "${lesson}". Folders: ${readdirSync(lessonsDir).join(', ')}`)
  process.exit(1)
}

const dir = resolve(lessonsDir, folder)
const vite = resolve(root, 'node_modules/.bin/vite')
const children = []

function run(cmd, args, options = {}) {
  const child = spawn(cmd, args, { cwd: dir, stdio: 'inherit', ...options })
  children.push(child)
  return child
}

function stopAll(code) {
  for (const child of children) child.kill()
  process.exit(code)
}
process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))

if (existsSync(resolve(dir, 'api.ts'))) {
  run('node', ['api.ts'])
}

if (rest[0] === 'build') {
  // vite build, then serve the output
  const build = run(vite, ['build', ...rest.slice(1)])
  build.on('exit', (code) => {
    if (code !== 0) stopAll(code ?? 1)
    const preview = run(vite, ['preview'])
    preview.on('exit', (c) => stopAll(c ?? 0))
  })
} else {
  const server = run(vite, rest)
  server.on('exit', (code) => stopAll(code ?? 0))
}
