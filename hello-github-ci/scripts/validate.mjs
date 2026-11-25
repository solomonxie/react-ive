// Checks every lesson workflow and the composite action against GitHub's
// schemas, so a typo shows up here instead of on GitHub.
// Uses action-validator, which only checks structure. It doesn't know
// whether an action or input exists, and it can't run anything.
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const bin = join(root, 'node_modules/.bin/action-validator')

const files = [
  ...readdirSync(join(root, 'lessons'))
    .filter((name) => name.endsWith('.yml') && name !== '10-dependabot.yml')
    .sort()
    .map((name) => join('lessons', name)),
  'actions/setup/action.yml',
]

let failed = 0
for (const file of files) {
  try {
    execFileSync(bin, [file], { cwd: root, stdio: 'pipe' })
    console.log(`ok    ${file}`)
  } catch (error) {
    failed += 1
    console.log(`FAIL  ${file}`)
    console.log(String(error.stdout || error.stderr).trim())
  }
}

console.log(failed ? `\n${failed} file(s) failed` : `\nall ${files.length} files are valid`)
process.exit(failed ? 1 : 0)
