// Errors — one place that turns every failure into a clean JSON response.
// Goal: throw from handlers instead of hand-building error replies, and
// shape all errors (yours, validation, unexpected) in setErrorHandler.
//
// Run:  npm run lesson -- 05

import Fastify, { type FastifyError } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { z } from 'zod'

// An error class that carries its own HTTP status. This HttpError idea is
// common in real services.
class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message)
  }
}

const app = Fastify({ logger: { level: 'fatal' } }).withTypeProvider<ZodTypeProvider>()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler((error: FastifyError | HttpError, request, reply) => {
  // 1. Bad input caught by a zod schema -> 400 with the field problems.
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.code(400).send({
      error: 'invalid request',
      issues: error.validation.map((issue) => ({
        field: issue.instancePath || '/',
        message: issue.message,
      })),
    })
  }
  // 2. Our own errors -> their status and message.
  if (error instanceof HttpError) {
    return reply.code(error.statusCode).send({ error: error.message })
  }
  // 3. Anything else is a bug: log it, and don't leak details to the client.
  request.log.error(error)
  return reply.code(500).send({ error: 'something went wrong' })
})

// Unknown URLs get the same JSON shape.
app.setNotFoundHandler((request, reply) => {
  reply.code(404).send({ error: `no route for ${request.method} ${request.url}` })
})

const users = new Map([[1, { id: 1, name: 'Ada' }]])

app.get(
  '/users/:id',
  { schema: { params: z.object({ id: z.coerce.number().int() }) } },
  async (request) => {
    const user = users.get(request.params.id)
    if (!user) {
      throw new HttpError(404, `user ${request.params.id} not found`)
    }
    return user
  },
)

app.get('/boom', async () => {
  throw new Error('database password is hunter2') // must not reach the client
})

for (const url of ['/users/1', '/users/2', '/users/abc', '/boom', '/nope']) {
  const res = await app.inject({ method: 'GET', url })
  console.log(url.padEnd(10), res.statusCode, res.json())
}

await app.close()
