# Fastify: a progressive learning path

Fastify is a Node.js web framework for building HTTP APIs, like Express but
faster, with schemas, plugins and good TypeScript support built in.

A common way to run Fastify services in production is zod schemas on every
route through `fastify-type-provider-zod`, and OpenAPI docs from
`@fastify/swagger`. These lessons build up to that setup, and the last two combine it with
Drizzle (see `../hello-drizzle`).

## Setup

```sh
cd hello-fastify
npm install
```

## How to run a lesson

```sh
npm run lesson -- 01
make lesson N=05
make test            # lesson 08
```

Lessons 01, 02, 06 and 07 start a server on http://127.0.0.1:3000 and keep
running until you press Ctrl-C. The others print their results and exit.

## Lessons

- `01-hello-server.ts`: create an app, add a GET route, log with pino, send a
  fake request with `inject()`, start the server with `listen()`
- `02-routes-and-params.ts`: path params (`/notes/:id`), query strings, JSON
  bodies, status codes with `reply.code()`, typed with generics only (no
  runtime checks yet)
- `03-zod-validation.ts`: zod schemas for body, params, query and response;
  bad input gets a 400, handlers get typed input, and responses drop fields
  that aren't in their schema
- `04-plugins-and-hooks.ts`: split the app with `register()` and URL
  prefixes, share things with `decorate()`, run code around requests with
  hooks (`onRequest`, `onSend`), and see how plugins keep things to
  themselves unless wrapped in `fastify-plugin`
- `05-errors.ts`: throw an `HttpError` from handlers, and shape every error
  (validation, your own, unexpected) in one `setErrorHandler`, without
  leaking internals in 500s
- `06-openapi-docs.ts`: turn the zod schemas into an OpenAPI spec and a
  Swagger UI page at `/docs`
- `07-notes-app.ts`: a small real API, Fastify + Drizzle + PGlite: the database
  as a plugin, a `buildApp()` factory, CRUD routes, and a zod codec to send
  dates as ISO strings
- `08-testing.test.ts`: test lesson 07's app with `node:test` and `inject()`,
  with a fresh app and empty database per test

## Notes

- `fastify-type-provider-zod` v7 serializes responses with zod's `encode`, so a
  response schema can't use a one-way `.transform()`. Use `z.codec(...)` for
  values that need converting on the way out, like `Date` → string (lesson 07).
- Many real projects test with Jest rather than `node:test`, but `app.inject()` works the
  same in both.
