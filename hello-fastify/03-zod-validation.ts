// Zod validation — schemas that check requests at runtime AND type them.
// Goal: one zod schema per input gives you a 400 for bad input, typed
// `request.body` / `params` / `query`, and a checked response shape.
// This is a common way to build Fastify services in production.
//
// Run:  npm run lesson -- 03

import Fastify, { type InjectOptions } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { z } from 'zod'

// Tell Fastify to use zod for validating input and serializing output, then
// switch on the type provider so TypeScript reads types from the schemas.
const app = Fastify({ logger: { level: 'warn' } }).withTypeProvider<ZodTypeProvider>()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const Note = z.object({
  id: z.number().int(),
  text: z.string(),
  tags: z.array(z.string()),
})
type Note = z.infer<typeof Note>

const notes: Note[] = []
let nextId = 1

app.post(
  '/notes',
  {
    schema: {
      body: z.object({
        text: z.string().min(1).max(200),
        tags: z.array(z.string()).default([]),
      }),
      response: { 201: Note },
    },
  },
  async (request, reply) => {
    // request.body is typed { text: string; tags: string[] }, with no generic needed.
    const note = { id: nextId++, ...request.body }
    notes.push(note)
    return reply.code(201).send(note)
  },
)

app.get(
  '/notes/:id',
  {
    schema: {
      // z.coerce turns the URL's "3" into the number 3 before checking it.
      params: z.object({ id: z.coerce.number().int().positive() }),
      response: { 200: Note, 404: z.object({ error: z.string() }) },
    },
  },
  async (request, reply) => {
    const note = notes.find((n) => n.id === request.params.id)
    if (!note) {
      return reply.code(404).send({ error: 'note not found' })
    }
    return note
  },
)

app.get(
  '/notes',
  {
    schema: {
      querystring: z.object({
        limit: z.coerce.number().int().min(1).max(50).default(10),
      }),
      // The response schema also strips extra fields: a password or internal
      // field on the object never leaks to the client.
      response: { 200: z.array(Note.pick({ id: true, text: true })) },
    },
  },
  async (request) => notes.slice(0, request.query.limit),
)

const show = async (label: string, options: InjectOptions) => {
  const res = await app.inject(options)
  console.log(`${label} -> ${res.statusCode}`, res.json())
}

await show('good POST', { method: 'POST', url: '/notes', payload: { text: 'buy milk', tags: ['home'] } })
await show('empty text', { method: 'POST', url: '/notes', payload: { text: '' } })
await show('missing body field', { method: 'POST', url: '/notes', payload: { tags: [] } })
await show('id is not a number', { method: 'GET', url: '/notes/abc' })
await show('found', { method: 'GET', url: '/notes/1' })
await show('list without tags', { method: 'GET', url: '/notes?limit=5' })
await show('limit too big', { method: 'GET', url: '/notes?limit=500' })

await app.close()
