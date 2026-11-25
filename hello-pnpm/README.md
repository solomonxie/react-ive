# hello-pnpm

A guided exercise for pnpm and pnpm workspaces, for someone who works in a large
monorepo and wants to know how it is wired. There are no lesson
files to run. You type the commands in a tiny sample workspace that looks like
a big monorepo in miniature, and each step says what you should see and where the
same thing usually shows up in a real one.

Everything here was run with pnpm 12.23.0 on Node 26 (macOS). A real monorepo
may pin a different pnpm version in its root `package.json`, so small details may
differ.

## The sample workspace

`workspace/` has:

- `package.json` with `packageManager: pnpm@12.23.0` (like the root of a real monorepo)
- `pnpm-workspace.yaml` with `packages: ["modules/*"]`
- `modules/common` (`@hello/common`): a zod schema and a `greet` function
- `modules/client` (`@hello/client`): depends on common
- `modules/api` (`@hello/api`): a tiny Node server, depends on common
- `modules/web` (`@hello/web`): depends on client and common
- `scripts/build.mjs`: a fake "build" that copies `src/` to `lib/` and prints a
  line, so you can see the build order

Dependency graph: `web -> client -> common` and `api -> common`.

## Running pnpm

pnpm may not be installed. Every command below says `pnpm`. If you do not have
it, make a shell alias that runs the pinned version through npx:

    alias pnpm='npx -y --loglevel=error pnpm@12.23.0'

(Or use `corepack enable`, which reads `packageManager` from `package.json`.
Corepack was not available on the machine this was written on, so the alias is
what was tested.) The Makefile does the same with `make install`, `make build`,
`make run`, `make clean`.

Run all commands from `hello-pnpm/workspace/` unless a step says otherwise.
Steps 07, 08 and 09 edit files. Each says how to undo its edit.

## 01. pnpm versus npm

Learn: pnpm keeps one copy of every package version in a global store and links
it into each project. `node_modules` is mostly symlinks, and a package can only
import what it declared.

Run:

    pnpm install
    ls -la node_modules modules/common/node_modules
    ls -la modules/web/node_modules/@hello

See: `modules/common/node_modules/zod` is a symlink into
`node_modules/.pnpm/zod@4.6.7/node_modules/zod`. The install output says
"Packages are cloned from the content-addressable store to the virtual store",
and names the store (on macOS `~/Library/pnpm/store/v11`). A second project
needing zod 4.6.7 reuses the same files on disk.

Now try the strictness. `client` never declared zod, so it cannot import it:

    cd modules/client
    node -e "import('zod').catch(e => console.log(e.code))"
    cd ../..

You should see `ERR_MODULE_NOT_FOUND`. With npm's flat `node_modules` this
would work by accident (a "phantom dependency"). With pnpm it fails.

In a real monorepo: this is why a module must list everything it imports in its own
`package.json`. If the frontend app imports a package only another module
declared, pnpm will not let it through.

## 02. A workspace

Learn: a workspace is a folder with a `pnpm-workspace.yaml` listing where the
packages live. One `pnpm install` at the root installs all of them and writes one
lockfile.

Run:

    cat pnpm-workspace.yaml
    pnpm ls -r --depth -1

See: the yaml has `packages: ["modules/*"]`, and the list shows five projects:
the root and the four `@hello/*` modules (the install says "all 5 workspace
projects").

In a large monorepo you'll often see a `pnpm-workspace.yaml` with several
patterns, such as `packages: ["modules/**", "third-party/*", "!modules/legacy"]`.
`**` means any depth, and a `!` line leaves one folder out. Packages are usually
named with a shared scope like `@acme/<module>`, and the root is a project with
its own name. That is why install commands in such repos often have both
`--filter <root-name>` and `--filter @acme/<module>...`.

## 03. `workspace:` dependencies

Learn: when one package depends on another in the same repo, you write the
version as `workspace:*`. pnpm links the local folder instead of downloading.

Run:

    cat modules/web/package.json
    ls -la modules/web/node_modules/@hello
    grep -A12 "modules/web:" pnpm-lock.yaml

See: `"@hello/client": "workspace:*"` in the manifest, symlinks
`client -> ../../../client` and `common -> ../../../common` in `node_modules`,
and in the lockfile `specifier: workspace:*` with `version: link:../client`.
Edit `modules/common/src/index.js` and the change shows up in `web` right away
(after the build step copies it to `lib/`).

In a real monorepo: an app such as `@acme/web` depends on shared packages like
`@acme/common` this way. When you
publish a package, pnpm rewrites `workspace:*` to the real version.

## 04. `--filter`

Learn: `--filter` picks which packages a command runs in. Quote the selectors
that contain `^` or `...` so your shell leaves them alone.

Run:

    pnpm --filter @hello/web start
    pnpm --filter ./modules/api build
    pnpm --filter "@hello/web*" ls --depth -1

See: `web: hello, web (via client)`, then `built @hello/api ...`, then the
listing for `@hello/web` only. By name, by folder path (`./modules/api`) and by
glob all work. Repeating `--filter` adds to the selection.

In a real monorepo: `pnpm --filter @acme/api <script>` runs one
module's script. A root `package.json` script often repeats `--filter` for several modules.

## 05. `...` and `^...`

Learn: the dots follow the dependency graph.

- `pkg...` means pkg and everything it depends on, transitively
- `pkg^...` means the same but without pkg itself
- `...pkg` means pkg and everything that depends on it
- `...^pkg` means the dependents only, without pkg

Run (each builds, so the log shows what was selected):

    pnpm --filter "@hello/web..." build
    pnpm --filter "@hello/web^..." build
    pnpm --filter "...@hello/common" build

See:

- `@hello/web...` builds common, client, web (in that order)
- `@hello/web^...` builds common, client (not web)
- `...@hello/common` builds common, then api, client, then web

Note the order: pnpm builds dependencies before dependents (topological order).
`api` and `client` do not depend on each other, so they run side by side and
their lines can swap places.

In a real monorepo: setup docs often boil down to exactly this.

- `pnpm --filter <root-name> --filter @acme/<module>... install` installs
  only that module and what it needs
- `pnpm --filter @acme/<module>^... build` builds its dependencies so you
  can then test the module itself

You build the dependencies first because shared packages often point
`main` and `types` at a built `lib/` folder, so a module that imports one needs
that `lib/` to exist.

## 06. Running scripts in many packages

Learn: `-r` runs a script in every package that has it, in dependency order.
`--parallel` ignores the order and runs everything at once (good for dev servers
that never exit).

Run:

    pnpm -r build
    pnpm run-local
    cat package.json

See: `pnpm -r build` lists common first, api and client next, web last. Packages
without a `build` script (the root) are skipped. `pnpm run-local` is a root script,
`pnpm --parallel --filter @hello/api --filter @hello/web run start`, and starts
`web` and `api` together. (The sample api exits after 1.5 seconds so the demo ends
by itself.)

In a real monorepo: a root "run everything locally" script is the same idea, running several
modules in parallel with `pnpm --parallel --filter ... run <script>`.

## 07. The lockfile and CI

Learn: `pnpm-lock.yaml` records the exact version of everything. Commit it. Use
`pnpm install --frozen-lockfile` in CI: it never changes the lockfile and fails if
it is out of date.

Run:

    head -30 pnpm-lock.yaml
    pnpm --filter @hello/api add ms
    grep -B1 -A3 "modules/api:" pnpm-lock.yaml

Now break the lockfile on purpose by editing `modules/api/package.json` so `ms`
says `^1.0.0` (the lockfile says `^2.1.3`):

    pnpm install --frozen-lockfile

See: the lockfile has an `importers:` section (one entry per package, with
`specifier` and resolved `version`) and a `packages:` section with the integrity
hashes. After the edit, the frozen install fails with a message like
`1 dependency is mismatched: ms (lockfile: ^2.1.3, manifest: ^1.0.0)`.

Undo: `pnpm --filter @hello/api remove ms`.

Because of the `packageManager` field, this lockfile also lists pnpm itself under
`packageManagerDependencies`. That is normal in pnpm 12.

In a real monorepo: one `pnpm-lock.yaml` at the root covers every module. Changing
any module's dependencies means committing the lockfile change too, or CI's
frozen install fails.

## 08. Pin one version everywhere: `overrides` and `catalog`

Learn: two ways to keep a version the same across the repo.

- `overrides` force a version for a package everywhere, even deep inside other
  packages' dependencies
- `catalog` is a named list of versions that packages opt into with
  `"zod": "catalog:"`

Run catalog first. Replace `pnpm-workspace.yaml` with:

    packages:
      - "modules/*"

    catalog:
      zod: ^4.0.0

Change `modules/common/package.json` to `"zod": "catalog:"`, then:

    pnpm install
    grep -A4 "^catalogs:" pnpm-lock.yaml

See: the lockfile gets a `catalogs:` section with the specifier and the resolved
version.

Now overrides. Add this to `pnpm-workspace.yaml`:

    overrides:
      ms: 2.1.3

Then:

    pnpm --filter @hello/api add ms@1
    pnpm why ms
    grep -A2 "^overrides:" pnpm-lock.yaml

See: you asked for `ms@1`, but `pnpm why ms` shows `ms@2.1.3`. The lockfile
records the `overrides:` too.

Undo: `pnpm --filter @hello/api remove ms`, then delete the `catalog` and
`overrides` blocks and put `"zod": "^4.0.0"` back.

In a real monorepo: `pnpm-workspace.yaml` often has an `overrides:` block that pins shared
versions of common libraries, plus
security pins like `"lodash@<4.18.1": "^4.18.1"` (only versions below 4.18.1
are changed). Entries like `"pg>pg-native": "-"` remove an optional dependency of
`pg`. The `overrides` block used to live in root `package.json` under `"pnpm"`;
pnpm 10+ no longer reads it there, so it moved to this file.

## 09. Build scripts and supply-chain settings

Learn: since pnpm 10, install scripts (`postinstall` and friends) of
dependencies do not run unless you allow them. This stops a malicious
dependency from running code on your machine.

Run:

    pnpm --filter @hello/api add esbuild

See: the install finishes the download, then fails with
`ERR_PNPM_IGNORED_BUILDS ... Ignored build scripts: esbuild@...` and suggests
`pnpm approve-builds`. Now allow it by adding this to `pnpm-workspace.yaml`:

    allowBuilds:
      esbuild: true

and run `pnpm install` again. You should see
`esbuild ... postinstall: Done`. (`pnpm rebuild` runs the scripts again later.)

Two more settings worth knowing, both in the real file:

    minimumReleaseAge: 10080   # minutes: refuse versions published less than 7 days ago
    blockExoticSubdeps: true   # transitive deps may not come from git or tarball URLs

With these on, `pnpm add` and `pnpm install` still worked for esbuild here,
since the version we got was older than 7 days. A brand new release would be
refused until it ages.

Undo: `pnpm --filter @hello/api remove esbuild`, then remove those blocks from
`pnpm-workspace.yaml`.

In a real monorepo: `pnpm-workspace.yaml` often has `allowBuilds` (the packages allowed to
run install scripts), `minimumReleaseAgeExclude` (packages exempt from the age
rule, for example the team's own packages, which are published fresh) and
`blockExoticSubdeps: true`. If `pnpm install` fails with `ERR_PNPM_IGNORED_BUILDS`
after you add a dependency, the fix is an `allowBuilds` entry there.

## 10. Inspecting: `pnpm why`, `pnpm list`, `pnpm add --filter`

Learn: the tools for answering "who pulled this in?" and "what does this
package have?".

Run:

    pnpm why zod
    pnpm ls -r --depth 1
    pnpm --filter @hello/web add -D ms
    pnpm --filter @hello/web remove ms
    pnpm add -w -D ms     # -w adds to the workspace root
    pnpm remove ms

See:

- `pnpm why zod` shows `@hello/common` as the only reason zod is installed
- `pnpm ls -r --depth 1` prints a tree per package. Workspace links look like
  `@hello/common@link:../common`, and `[deduped]` marks repeats
- `--filter ... add` changes just that package's `package.json` and the lockfile

Note: older pnpm refused `pnpm add foo` at the workspace root without `-w`. In
12.23.0 it just worked and added `foo` to the root `package.json`, so pass
`--filter` when you mean a module, or you may add it to the root by accident.

In a real monorepo: `pnpm why <pkg>` is the quickest way to see whether a pin
from `overrides` is really the only copy, and
`pnpm --filter @acme/api add <pkg>` is how you add a dependency to one
module.

## Cheat sheet

- `pnpm install`: install everything. `--frozen-lockfile` for CI
- `pnpm --filter <pkg> <cmd>`: one package
- `pnpm --filter "<pkg>..." <cmd>`: it and its dependencies
- `pnpm --filter "<pkg>^..." <cmd>`: only its dependencies
- `pnpm --filter "...<pkg>" <cmd>`: it and its dependents
- `pnpm -r <script>`: all packages, dependency order
- `pnpm --parallel ...`: all at once, ignore order
- `pnpm why <pkg>`, `pnpm ls -r --depth 1`: inspect

## Clean up

    make clean

removes `node_modules` and the built `lib/` folders.
