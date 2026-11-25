# Vite: a progressive learning path

Vite is the dev server and build tool behind many large React apps.
In dev it serves your files as native ES modules and
compiles each one when the browser asks for it. For production it bundles
everything into a few hashed files. Plugins add the rest (React, SVGs, and so on).

These lessons use versions and plugins common in real apps: Vite 8,
`@vitejs/plugin-react-swc`, `vite-plugin-svgr` and `vite-plugin-node-polyfills`
(all installed). Each lesson has comments marked `In a real app:` that show
where the same idea shows up in a typical `vite.config.ts`.

## Setup

```sh
cd hello-vite
npm install      # or: make install
```

## How to run a lesson

```sh
npm run lesson -- 03
make lesson N=05
make lesson N=05 ARGS="--mode staging"
make lesson N=07 ARGS=build      # vite build, then vite preview
make typecheck
make lint
```

Every lesson is a folder under `lessons/` with its own `index.html` (and a
`vite.config.ts` when the lesson is about config). The runner starts Vite inside
that folder and keeps running until you press Ctrl-C. Extra arguments go to
Vite, for example `--port 5200`. Lesson 06 also starts its own tiny backend.

## Lessons

- `lessons/01-dev-server`: `vite` with a plain TypeScript file and no framework.
  The browser requests `main.ts` and Vite compiles it on the fly. HMR with
  `import.meta.hot` so edits show up without a reload.
- `lessons/02-html-and-assets`: `index.html` is the entry point. Importing CSS,
  JSON, images, `?raw`, and what `public/` is for.
- `lessons/03-react-swc`: React through plugins. `plugin-react-swc` for JSX and
  Fast Refresh, `vite-plugin-svgr` for `import Logo from './logo.svg?react'`.
- `lessons/04-aliases`: `@features/*` from tsconfig `paths`
  (`resolve.tsconfigPaths`) and `resolve.alias` with a regex, as large apps often do.
- `lessons/05-env-vars`: `import.meta.env`, the `VITE_` prefix, `.env` files,
  `--mode`, and `define` (how an app can pass `process.env.API_ROOT`).
- `lessons/06-dev-proxy`: `server.proxy` so the page calls `/api` on its own
  origin and skips CORS. Notes that many apps use an `API_ROOT` setting instead.
- `lessons/07-build`: `vite build`, hashed output, dynamic `import()` for code
  splitting, `vite preview`, and the build options real apps often set (`outDir`,
  `sourcemap`, `base`).
- `lessons/08-custom-plugin`: a virtual module (`resolveId` + `load`), a
  `transform`, and a `configureServer` middleware. The last one is how
  an app can serve a file like `/version.txt` in dev.

## Notes

- `react` is only used from lesson 03 on. Lessons 01, 02 and 05 to 08 are plain TS.
- Lesson 05: `SECRET_TOKEN` in `.env` is not shown on the page. Only `VITE_` names are.
- `make clean` removes `node_modules` and any lesson's `dist/`.
