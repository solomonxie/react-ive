import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const lessons = {
  '01': '01-hello-server.ts',
  '02': '02-routes-and-params.ts',
  '03': '03-zod-validation.ts',
  '04': '04-plugins-and-hooks.ts',
  '05': '05-errors.ts',
  '06': '06-openapi-docs.ts',
  '07': '07-notes-app.ts',
  '08': '08-testing.test.ts',
}

const lesson = process.argv[2] ?? '01'
const file = lessons[lesson]

if (!file) {
  console.error(`Unknown lesson "${lesson}". Choose a lesson from 01 to 08.`)
  process.exit(1)
}

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const tsxCommand = resolve(projectRoot, 'node_modules/.bin/tsx')
const tsxExecutable = process.platform === 'win32' ? `${tsxCommand}.cmd` : tsxCommand
// Test files run under node's built-in test runner.
const args = file.endsWith('.test.ts') ? ['--test', file] : [file]
const child = spawn(tsxExecutable, args, {
  cwd: projectRoot,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
