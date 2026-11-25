# hello-github-ci

GitHub Actions from a first workflow up to the setup a real TypeScript
monorepo tends to end up with: pnpm and Node pinned, a shared setup step,
jobs that skip themselves when nothing relevant changed, one required "CI
passed" check, a hand-managed cache, a check that generated files are
committed, reusable workflows, and safe handling of secrets and untrusted
input.

Each lesson is one workflow file in `lessons/`, with the explanation in its
comments. They all check the same tiny pnpm workspace in `app/`.

## What's here

- `lessons/NN-*.yml`: the workflows, one idea each.
- `actions/setup/action.yml`: the composite action lessons 05-09 share.
- `app/`: a two-package pnpm workspace (`@sample/common` and `@sample/web`)
  with lint (oxlint), tests (`node --test`), a fake build, and a
  `generate` script that writes `packages/web/generated/routes.json`.
- `scripts/validate.mjs`: checks every workflow against GitHub's schemas.
- `scripts/try-lesson.mjs`: copies a lesson into `.github/workflows/` so you
  can run it on GitHub.

## Setup

```sh
cd hello-github-ci
make install      # npm install here, pnpm install in app/
make validate     # check every workflow file
make app          # run lint, test, build and generate the way CI does
```

pnpm runs through `npx pnpm@12.23.0`, so nothing needs installing globally.

## Running a lesson on GitHub

GitHub only runs workflows from `.github/workflows/` at the root of the repo,
which is why the lessons live in `lessons/` and do nothing until copied.

```sh
npm run try -- 03         # copies lessons/03-*.yml to ../.github/workflows/
```

It prints the git and `gh` commands to push a branch and open a draft pull
request. `gh run watch` follows the run in the terminal, and
`gh run view --log-failed` shows only the failing steps. When you're done,
`npm run try -- clean` removes the copies.

The workflows point at `hello-github-ci/...` paths, because GitHub checks out
the whole repo and runs from its root.

## Lessons

- `01-first-workflow.yml`: the parts of a workflow. `on`, jobs, `runs-on`,
  steps with `run` and `uses`, `actions/checkout`, `${{ }}` expressions and
  `env`.
- `02-node-and-pnpm.yml`: pin pnpm from `packageManager` and Node from
  `.nvmrc`, install with `--frozen-lockfile`, then lint, test and build.
  `defaults.run.working-directory` for a project in a subfolder.
- `03-jobs-needs-matrix.yml`: jobs run in parallel unless one `needs`
  another. A `matrix` over Node versions with `fail-fast: false`, and
  `timeout-minutes` so a stuck job doesn't run for hours.
- `04-triggers-concurrency-permissions.yml`: `pull_request` types, skipping
  drafts, `workflow_dispatch` (a "Run workflow" button and
  `gh workflow run`), `concurrency` to cancel runs made stale by a newer push,
  and `permissions` to keep the token read-only.
- `05-shared-setup.yml`: a composite action (`actions/setup/action.yml`)
  bundles checkout-to-install so every job is a few lines. It takes a
  `filter` input to install only one package and what it depends on.
- `06-skip-work-and-one-required-check.yml`: a `changes` job uses
  `dorny/paths-filter` and job `outputs` to skip work on docs-only changes.
  `pnpm --filter "...[origin/<base>]"` tests only the packages a pull request
  affects. A final `CI passed` job with `if: always()` is the single check
  branch protection needs to require.
- `07-cache-and-generated-files.yml`: restore-only caching with one job on
  the default branch saving the pnpm store, and why that beats saving from
  every job. Then run `pnpm generate` and fail if `git status --porcelain`
  shows the committed generated files are stale.
- `08-build-package.yml` and `08-release.yml`: a reusable workflow
  (`on: workflow_call`) with inputs, secrets and outputs, and a caller that
  runs it once per package with a matrix.
- `09-secrets-and-safety.yml`: secrets and why fork PRs don't get them, OIDC
  (`id-token: write`) instead of long-lived keys, passing untrusted text like
  a PR title through `env` instead of pasting it into `run`, and pinning
  third-party actions to a commit SHA.
- `10-dependabot.yml`: not a workflow. A `.github/dependabot.yml` that opens
  grouped version-bump PRs for npm and keeps workflow actions current.

## Things to try

- Lesson 07: change a page title in `app/packages/web/src/routes.js` without
  running `pnpm generate`, push, and watch the check fail with the diff.
- Lesson 06: change only a `.md` file and see `test` skipped while
  `CI passed` still goes green.
- Lesson 03: add `20` to the Node matrix and see which versions pass.
- Lesson 04: push twice quickly and see the first run cancelled.

## Notes

- `make validate` uses action-validator. It checks each file's structure
  against GitHub's published schemas, so it catches typos and misplaced keys,
  but it doesn't know whether an action or one of its inputs exists, and it
  can't run anything. Only GitHub (or a local runner like `act`) can.
- Action versions (`@v7`, `@v6`) were current when this was written. Lesson
  09 shows the pinned-SHA style instead.
