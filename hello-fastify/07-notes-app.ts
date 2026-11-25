// Fastify + Drizzle — a small but real API: routes in a plugin, data in Postgres.
// Goal: put lessons together the way real services often do: a buildApp()
// factory, the database decorated onto the app, zod schemas on every route,
// and Drizzle doing the queries. Lesson 08 tests this exact app.
//
// Run:  npm run lesson -- 07
// Try:  curl -X POST localhost:3000/notes -H 'content-type: application/json' -d '{"text":"hi"}'
//       curl localhost:3000/notes
//       curl -X PATCH localhost:3000/notes/1 -H 'content-type: application/json' -d '{"done":true}'

import { PGlite } from '@electric-sql/pglite'
import { desc, eq } from 'drizzle-orm'
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite'
import Fastify, { type FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { z } from 'zod'

// --- database ---------------------------------------------------------------

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  done: boolean('done').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

type Db = PgliteDatabase

declare module 'fastify' {
  interface FastifyInstance {
    db: Db
  }
}

// Opens the database when the app starts and closes it when the app closes.
// onClose is a lifecycle hook for the app itself, not for requests.
const dbPlugin = fp(async (app) => {
  const client = new PGlite()
  await client.exec(`
    create table notes (
      id serial primary key,
      text text not null,
      done boolean not null default false,
      created_at timestamp not null default now()
    )
  `)
  app.decorate('db', drizzle({ client }))
  app.addHook('onClose', async () => {
    await client.close()
  })
})

// --- routes -----------------------------------------------------------------

// The database hands back a Date; JSON can only carry a string. A codec
// is a two-way conversion: decode (string -> Date) for input, encode
// (Date -> string) for output. fastify-type-provider-zod v7 serializes
// responses with encode, so a one-way .transform() wouldn't work here.
const isoDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (text) => new Date(text),
  encode: (date) => date.toISOString(),
})

const Note = z.object({
  id: z.number().int(),
  text: z.string(),
  done: z.boolean(),
  createdAt: isoDate,
})
const IdParams = z.object({ id: z.coerce.number().int().positive() })
const NotFound = z.object({ error: z.string() })

const noteRoutes: FastifyPluginAsync = async (base) => {
  const app = base.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/',
    {
      schema: {
        querystring: z.object({ done: z.stringbool().optional() }),
        response: { 200: z.array(Note) },
      },
    },
    async (request) => {
      const { done } = request.query
      const query = app.db.select().from(notes).orderBy(desc(notes.id))
      return done === undefined ? query : query.where(eq(notes.done, done))
    },
  )

  app.post(
    '/',
    {
      schema: {
        body: z.object({ text: z.string().trim().min(1).max(500) }),
        response: { 201: Note },
      },
    },
    async (request, reply) => {
      const [note] = await app.db.insert(notes).values(request.body).returning()
      return reply.code(201).send(note!)
    },
  )

  app.patch(
    '/:id',
    {
      schema: {
        params: IdParams,
        body: z.object({ text: z.string().trim().min(1).optional(), done: z.boolean().optional() }),
        response: { 200: Note, 404: NotFound },
      },
    },
    async (request, reply) => {
      const [note] = await app.db
        .update(notes)
        .set(request.body)
        .where(eq(notes.id, request.params.id))
        .returning()
      if (!note) {
        return reply.code(404).send({ error: 'note not found' })
      }
      return note
    },
  )

  app.delete(
    '/:id',
    { schema: { params: IdParams, response: { 204: z.null(), 404: NotFound } } },
    async (request, reply) => {
      const deleted = await app.db.delete(notes).where(eq(notes.id, request.params.id)).returning()
      if (deleted.length === 0) {
        return reply.code(404).send({ error: 'note not found' })
      }
      return reply.code(204).send(null)
    },
  )
}

// --- app factory ------------------------------------------------------------

// A function that builds a fresh app. Tests call it to get an isolated app
// (and database) per test; the script below calls it to run a server.
export async function buildApp() {
  const app = Fastify({ logger: { level: 'warn' } })
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  await app.register(dbPlugin)
  await app.register(noteRoutes, { prefix: '/notes' })
  return app
}

// Only start a server when this file is run directly, not when lesson 08
// imports buildApp.
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await buildApp()
  await app.inject({ method: 'POST', url: '/notes', payload: { text: 'learn drizzle' } })
  await app.inject({ method: 'POST', url: '/notes', payload: { text: 'learn fastify' } })
  await app.listen({ port: 3000, host: '127.0.0.1' })
  console.log('notes API on http://127.0.0.1:3000/notes (Ctrl-C to stop)')
}
