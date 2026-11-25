// Lesson 04: protect an HTTP API with bearer tokens.
// This is what a typical API does on every request: read "Authorization: Bearer ...",
// verify it against the issuer's public keys (JWKS), check scopes, then use
// `sub` to look the user up. createRemoteJWKSet fetches and caches the keys.
import { createServer } from 'node:http'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { AUDIENCE, ISSUER, issueToken, startIssuer } from './03-fake-issuer.ts'

const API_PORT = 4101
const issuer = await startIssuer()
const jwks = createRemoteJWKSet(new URL(`${ISSUER}.well-known/jwks.json`))

const authenticate = async (header: string | undefined) => {
  const token = header?.match(/^Bearer (.+)$/)?.[1]
  if (!token) {
    return { status: 401, error: 'missing bearer token' } as const
  }
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: ISSUER, audience: AUDIENCE })
    return { status: 200, user: payload } as const
  } catch {
    return { status: 401, error: 'invalid token' } as const
  }
}

const api = createServer(async (request, response) => {
  const auth = await authenticate(request.headers.authorization)
  if (auth.status !== 200) {
    response.writeHead(auth.status, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: auth.error }))
    return
  }
  // Authorization: being logged in isn't enough, the token must carry the scope.
  const scopes = String(auth.user.scope ?? '').split(' ')
  if (request.url === '/exports' && !scopes.includes('read:exports')) {
    response.writeHead(403, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'needs read:exports' }))
    return
  }
  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(JSON.stringify({ hello: auth.user.sub, path: request.url }))
})
await new Promise<void>((resolve) => api.listen(API_PORT, resolve))

const call = async (label: string, token?: string) => {
  const headers: Record<string, string> = token ? { authorization: `Bearer ${token}` } : {}
  const response = await fetch(`http://localhost:${API_PORT}/exports`, { headers })
  console.log(`${label.padEnd(28)} → ${response.status} ${await response.text()}`)
}

await call('no token')
await call('garbage token', 'not.a.jwt')
await call('valid, wrong scope', await issueToken('auth0|viewer', 'read:dashboards'))
await call('valid, right scope', await issueToken('auth0|user-123', 'read:exports'))

api.close()
issuer.close()
console.log('\nTakeaway: 401 = we don\'t know who you are; 403 = we know, but you can\'t do this.')
