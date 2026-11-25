import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const lesson = process.argv[2] ?? '01'
const validLessons = new Set(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'])

if (!validLessons.has(lesson)) {
  console.error(`Unknown lesson "${lesson}". Choose a lesson from 01 to 17.`)
  process.exit(1)
}

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const viteCommand = resolve(projectRoot, 'node_modules/.bin/vite')
const viteExecutable = process.platform === 'win32' ? `${viteCommand}.cmd` : viteCommand
const server = spawn(viteExecutable, ['--open', `/?lesson=${lesson}`], {
  cwd: projectRoot,
  stdio: 'inherit',
})

server.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
