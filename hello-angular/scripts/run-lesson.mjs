import { spawn, exec } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const lesson = process.argv[2] ?? '01'
const validLessons = new Set(['01', '02', '03', '04', '05'])

if (!validLessons.has(lesson)) {
  console.error(`Unknown lesson "${lesson}". Choose a lesson from 01 to 05.`)
  process.exit(1)
}

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const ngCommand = resolve(projectRoot, 'node_modules/.bin/ng')
const ngExecutable = process.platform === 'win32' ? `${ngCommand}.cmd` : ngCommand
const url = `http://localhost:4200/?lesson=${lesson}`

// `ng serve --open` can only open the bare dev server URL, not one with a
// query string attached, so we start the server plain and open the
// lesson-specific URL ourselves once the server reports it is ready.
const server = spawn(ngExecutable, ['serve'], {
  cwd: projectRoot,
  stdio: ['inherit', 'pipe', 'inherit'],
})

let opened = false
server.stdout.on('data', (chunk) => {
  const text = chunk.toString()
  process.stdout.write(text)
  if (!opened && /Local:/.test(text)) {
    opened = true
    const openCommand =
      process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    exec(`${openCommand} ${url}`)
  }
})

server.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
