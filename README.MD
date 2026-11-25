# Progressive Frontend Learning

Progressive, learn-by-writing-code paths across frontend frameworks and tools,
plus the backend pieces a TypeScript web app sits on.
Each subfolder is a self-contained series of numbered lessons — every lesson
is a complete, runnable step that builds on the one before it.

## Backend

- `hello-drizzle`: Drizzle ORM on an in-memory Postgres (PGlite): schema,
  queries, joins, relations, transactions, migrations
- `hello-fastify`: Fastify APIs with zod validation, plugins, error handling,
  OpenAPI docs, and a final Fastify + Drizzle app with tests
- `hello-auth0`: JWTs, verifying tokens with jose, protecting an API with
  scopes, machine-to-machine tokens, and browser login with auth0-spa-js

## Tooling

- `hello-vite`: the Vite dev server, assets, React with SWC, path aliases,
  env vars, a dev proxy, production builds, and writing a plugin
- `hello-jest`: Jest with @swc/jest, mocks and fake timers, React Testing
  Library and user-event, hook tests, and a zod + react-hook-form form test
- `hello-pnpm`: pnpm workspaces in a small sample monorepo:
  `workspace:*`, `--filter` with `...` and `^...`, lockfile, overrides and
  catalogs, build-script approval
- `hello-github-ci`: GitHub Actions for a pnpm monorepo: pinned Node and
  pnpm, a shared setup action, skipping unchanged work, one required check,
  caching, generated-file checks, reusable workflows, secrets and safety
