// A tiny backend for lesson 06. The runner starts it for you (npm run lesson -- 06).
// Run directly with: node api.ts
// It sends NO CORS headers, so a browser page on another origin cannot read it.
import { createServer } from 'node:http'

const port = 4000
createServer((req, res) => {
  console.log(`[api] ${req.method} ${req.url}`)
  if (req.url === '/api/hello') {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ message: 'hello from the backend', at: new Date().toISOString() }))
    return
  }
  res.statusCode = 404
  res.end('not found')
}).listen(port, () => console.log(`[api] listening on http://localhost:${port}`))
