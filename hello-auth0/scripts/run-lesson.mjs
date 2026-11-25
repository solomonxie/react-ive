import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const lessons = {
  '01': '01-what-is-a-jwt.ts',
  '02': '02-sign-and-verify-with-jose.ts',
  '03': '03-fake-issuer.ts',
  '04': '04-protect-an-api.ts',
  '05': '05-real-tenant-m2m.ts',
  '06': '06-spa-login.ts',
}

const lesson = process.argv[2] ?? '01'
const file = lessons[lesson]

if (!file) {
  console.error(`Unknown lesson "${lesson}". Choose a lesson from 01 to 06.`)
  process.exit(1)
}

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const tsxCommand = resolve(projectRoot, 'node_modules/.bin/tsx')
const child = spawn(tsxCommand, [file], { cwd: projectRoot, stdio: 'inherit' })

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0))
})
