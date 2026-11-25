import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const lesson = process.argv[2] ?? '01'
const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))

// Lesson files look like 03-async-and-timers.test.ts(x). A lesson may have
// more than one file; they all run.
const files = readdirSync(projectRoot).filter((name) => /^\d\d-.*\.test\.tsx?$/.test(name))
const matches = files.filter((name) => name.startsWith(`${lesson}-`))

if (matches.length === 0) {
  const numbers = [...new Set(files.map((name) => name.slice(0, 2)))].join(', ')
  console.error(`Unknown lesson "${lesson}". Choose one of: ${numbers}.`)
  process.exit(1)
}

const jest = resolve(projectRoot, 'node_modules/.bin/jest')
const child = spawn(jest, ['--verbose', ...matches], { cwd: projectRoot, stdio: 'inherit' })

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
