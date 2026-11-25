// GitHub only runs workflows from .github/workflows/ at the root of the repo.
// This copies one lesson there so you can push it on a branch and watch it run.
//
//   npm run try -- 03       copy lesson 03 into ../.github/workflows/
//   npm run try -- clean    remove every lesson file copied there
import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const lessonsDir = join(root, 'lessons')
const workflowsDir = resolve(root, '../.github/workflows')
const lessonFiles = readdirSync(lessonsDir).filter((name) => name.endsWith('.yml'))
const arg = process.argv[2]

if (arg === 'clean') {
  for (const name of lessonFiles) {
    rmSync(join(workflowsDir, name), { force: true })
  }
  console.log(`Removed lesson workflows from ${workflowsDir}`)
  process.exit(0)
}

const picked = lessonFiles.filter((name) => name.startsWith(`${arg}-`))
if (!arg || picked.length === 0) {
  console.error('Usage: npm run try -- <01-09 | clean>')
  process.exit(1)
}
if (arg === '10') {
  console.error('Lesson 10 is a Dependabot config, not a workflow. Copy it to ../.github/dependabot.yml yourself.')
  process.exit(1)
}

mkdirSync(workflowsDir, { recursive: true })
for (const name of picked) {
  copyFileSync(join(lessonsDir, name), join(workflowsDir, name))
  console.log(`Copied ${name} -> .github/workflows/${name}`)
}
console.log(`
Next, from the repo root:
  git switch -c try-ci-${arg}
  git add .github hello-github-ci
  git commit -m "Try CI lesson ${arg}"
  git push -u origin try-ci-${arg}
  gh pr create --draft --fill     # for lessons that run on pull_request
  gh run watch                    # follow the run in the terminal

When you're done: npm run try -- clean, and delete the branch.`)
