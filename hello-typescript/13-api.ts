// The server side of lesson 13: a tiny HTTP API built on node:http.
// It treats the request body as `unknown` and runs the shared validate
// helper before saving anything.

import { createServer, type Server } from 'node:http'
import { z } from 'zod'
import { SavedPageGroupingSchema, type SavedPageGrouping, validatePageGrouping } from './13-shared-schema'

const saved: SavedPageGrouping[] = []

function send(res: import('node:http').ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

export function startApi(): Promise<Server> {
  const server = createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/groupings') {
      return send(res, 404, { error: 'not found' })
    }

    let text = ''
    for await (const chunk of req) {
      text += chunk
    }

    // Never trust the client's checks: someone can call the API with curl.
    let grouping
    try {
      grouping = validatePageGrouping(JSON.parse(text))
    } catch (error) {
      if (error instanceof z.ZodError) {
        return send(res, 400, { error: 'invalid grouping', issues: error.issues })
      }
      return send(res, 400, { error: 'body is not JSON' })
    }

    const row: SavedPageGrouping = { ...grouping, id: saved.length + 1, updatedAt: new Date() }
    saved.push(row)

    // Encode turns the Date back into an ISO string for the wire, the same
    // step fastify-type-provider-zod v7 runs on responses (lesson 12).
    return send(res, 201, z.encode(SavedPageGroupingSchema, row))
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}
