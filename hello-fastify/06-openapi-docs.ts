// OpenAPI docs — the zod schemas you already wrote become API docs.
// Goal: register @fastify/swagger and swagger-ui, and get a browsable
// /docs page and a /openapi.json spec for free. Real services often
// generate their specs the same way.
//
// Run:  npm run lesson -- 06
// Then: open http://localhost:3000/docs (Ctrl-C to stop).

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { z } from 'zod'

const app = Fastify({ logger: { level: 'warn' } }).withTypeProvider<ZodTypeProvider>()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Register swagger BEFORE the routes, so it sees each one as it's added.
// jsonSchemaTransform converts each route's zod schemas to JSON Schema.
await app.register(fastifySwagger, {
  openapi: {
    info: { title: 'Notes API', version: '1.0.0' },
  },
  transform: jsonSchemaTransform,
})
await app.register(fastifySwaggerUi, { routePrefix: '/docs' })

const Note = z
  .object({
    id: z.number().int(),
    text: z.string().describe('What the note says'),
  })
  .describe('A note')

app.post(
  '/notes',
  {
    schema: {
      summary: 'Create a note',
      tags: ['notes'],
      body: Note.omit({ id: true }),
      response: { 201: Note },
    },
  },
  async (request, reply) => reply.code(201).send({ id: 1, ...request.body }),
)

app.get(
  '/notes/:id',
  {
    schema: {
      summary: 'Get one note',
      tags: ['notes'],
      params: z.object({ id: z.coerce.number().int() }),
      response: { 200: Note },
    },
  },
  async (request) => ({ id: request.params.id, text: 'example' }),
)

// Expose the raw spec too, for clients and code generators.
app.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger())

// Routes must all be added before ready(); after it the app is sealed.
await app.ready()
// app.swagger() returns the generated OpenAPI document.
const spec = app.swagger()
console.log('paths in the spec:', Object.keys(spec.paths ?? {}))
console.log(JSON.stringify(spec.paths?.['/notes'], null, 2))

await app.listen({ port: 3000, host: '127.0.0.1' })
console.log('docs at http://127.0.0.1:3000/docs (Ctrl-C to stop)')
