// Hello server — the smallest Fastify app: one route, a logger, and a test
// request without opening a port.
// Goal: see Fastify's basic shape: create an app, add routes, start it.
//
// Run:  cd hello-fastify && npm install
//       npm run lesson -- 01
// Then: open http://localhost:3000/ in a browser (Ctrl-C to stop).

import Fastify from 'fastify'

// `logger: true` turns on pino, a fast JSON logger. Every request gets a log
// line with a request id. Many production services log through pino too.
const app = Fastify({ logger: true })

// A route = method + URL + handler. Whatever the handler returns is sent as
// the response; an object becomes JSON automatically.
app.get('/', async () => {
  return { hello: 'world' }
})

app.get('/time', async () => ({ now: new Date().toISOString() }))

// inject() sends a fake request straight into the app: no network, no port.
// It's how Fastify apps are usually tested (lesson 07).
const response = await app.inject({ method: 'GET', url: '/' })
console.log('inject says:', response.statusCode, response.json())

// listen() starts the real HTTP server.
await app.listen({ port: 3000, host: '127.0.0.1' })
