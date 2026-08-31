import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const lessons = {
  '01': '01-hello-world.ts',
  '02': '02-functions.ts',
  '03': '03-interfaces-and-types.ts',
  '04': '04-union-and-narrowing.ts',
  '05': '05-generics.ts',
  '06': '06-classes.ts',
  '07': '07-utility-types.ts',
  '08': '08-async-and-modules.ts',
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
const child = spawn(tsxExecutable, [file], {
  cwd: projectRoot,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
