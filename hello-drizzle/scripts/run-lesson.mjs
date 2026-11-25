import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const lessons = {
  '01': '01-connect.ts',
  '02': '02-schema-insert-select.ts',
  '03': '03-filter-update-delete.ts',
  '04': '04-joins.ts',
  '05': '05-relational-queries.ts',
  '06': '06-transactions.ts',
  '07': '07-migrations.ts',
}

const lesson = process.argv[2] ?? '01'
const file = lessons[lesson]

if (!file) {
  console.error(`Unknown lesson "${lesson}". Choose a lesson from 01 to 07.`)
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
