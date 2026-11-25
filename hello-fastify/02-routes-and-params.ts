// Routes and params — path params, query strings, bodies, status codes.
// Goal: read input from every part of a request and answer with the right
// status code. Still no validation; that's lesson 03.
//
// Run:  npm run lesson -- 02
// Try:  curl localhost:3000/notes
//       curl -X POST localhost:3000/notes -H 'content-type: application/json' -d '{"text":"buy milk"}'
//       curl localhost:3000/notes/1
//       curl 'localhost:3000/notes?search=milk'
//       curl -X DELETE localhost:3000/notes/1

import Fastify from 'fastify'

const app = Fastify({ logger: { level: 'warn' } })

type Note = { id: number; text: string }
const notes: Note[] = [{ id: 1, text: 'learn fastify' }]
let nextId = 2

// The generic tells TypeScript what request.query looks like. Nothing checks
// it at runtime yet; a client can still send anything.
app.get<{ Querystring: { search?: string } }>('/notes', async (request) => {
  const { search } = request.query
  if (!search) {
    return notes
  }
  return notes.filter((note) => note.text.includes(search))
})

// `:id` in the URL becomes request.params.id. It always arrives as a string.
app.get<{ Params: { id: string } }>('/notes/:id', async (request, reply) => {
  const note = notes.find((n) => n.id === Number(request.params.id))
  if (!note) {
    // reply.code() sets the status; return after sending.
    return reply.code(404).send({ error: 'note not found' })
  }
  return note
})

// Fastify parses JSON bodies for you.
app.post<{ Body: { text: string } }>('/notes', async (request, reply) => {
  const note = { id: nextId++, text: request.body.text }
  notes.push(note)
  return reply.code(201).send(note)
})

app.delete<{ Params: { id: string } }>('/notes/:id', async (request, reply) => {
  const index = notes.findIndex((n) => n.id === Number(request.params.id))
  if (index === -1) {
    return reply.code(404).send({ error: 'note not found' })
  }
  notes.splice(index, 1)
  return reply.code(204).send()
})

// A quick self-check with inject before the real server starts.
const created = await app.inject({ method: 'POST', url: '/notes', payload: { text: 'buy milk' } })
console.log('POST /notes ->', created.statusCode, created.json())
const missing = await app.inject({ method: 'GET', url: '/notes/99' })
console.log('GET /notes/99 ->', missing.statusCode, missing.json())

await app.listen({ port: 3000, host: '127.0.0.1' })
console.log('listening on http://127.0.0.1:3000 (Ctrl-C to stop)')
