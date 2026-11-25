// Plugins and hooks — split an app into pieces and run code around requests.
// Goal: Fastify's two big ideas beyond routes:
//   - plugins: `app.register(fn)` groups routes and setup, with a URL prefix
//   - hooks: run code at points in every request (onRequest, onSend...)
// plus `decorate`, which hangs shared things (a db, a config) on the app.
//
// Run:  npm run lesson -- 04

import Fastify, { type FastifyInstance, type FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

// Tell TypeScript about the things we decorate onto the app and requests.
declare module 'fastify' {
  interface FastifyInstance {
    config: { appName: string }
  }
  interface FastifyRequest {
    startedAt: number
  }
}

const app = Fastify({ logger: { level: 'warn' } })

// A plugin is just an async function that receives an app instance.
// Plugins are encapsulated: whatever they add stays inside them. fp()
// (fastify-plugin) opts out of that, so `app.config` is visible everywhere.
const configPlugin: FastifyPluginAsync = fp(async (instance) => {
  instance.decorate('config', { appName: 'hello-fastify' })
})

// Hooks: onRequest runs before the handler, onSend just before the reply
// goes out. Here they time each request and add a header.
const timingPlugin = fp(async (instance: FastifyInstance) => {
  instance.decorateRequest('startedAt', 0)
  instance.addHook('onRequest', async (request) => {
    request.startedAt = performance.now()
  })
  instance.addHook('onSend', async (request, reply) => {
    const ms = (performance.now() - request.startedAt).toFixed(2)
    reply.header('x-response-time', `${ms}ms`)
  })
})

// A normal (encapsulated) plugin: its routes and its hook stay inside it.
const adminRoutes: FastifyPluginAsync = async (instance) => {
  // This hook only runs for routes in this plugin: a tiny "auth" check.
  instance.addHook('onRequest', async (request, reply) => {
    if (request.headers['x-admin-token'] !== 'secret') {
      return reply.code(401).send({ error: 'admin token required' })
    }
  })
  instance.get('/stats', async () => ({ app: instance.config.appName, uptime: process.uptime() }))
}

const publicRoutes: FastifyPluginAsync = async (instance) => {
  instance.get('/hello', async () => ({ hello: instance.config.appName }))
}

await app.register(configPlugin)
await app.register(timingPlugin)
await app.register(publicRoutes, { prefix: '/api' })
await app.register(adminRoutes, { prefix: '/admin' })

// Wait for every plugin to load, then print the route tree.
await app.ready()
console.log(app.printRoutes())

for (const [url, headers] of [
  ['/api/hello', {}],
  ['/admin/stats', {}],
  ['/admin/stats', { 'x-admin-token': 'secret' }],
] as const) {
  const res = await app.inject({ method: 'GET', url, headers })
  console.log(url, res.statusCode, res.headers['x-response-time'], res.json())
}

await app.close()
