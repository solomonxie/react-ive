// Lesson 03: a fake Auth0 tenant on localhost.
// A real tenant publishes its public keys at /.well-known/jwks.json, and
// APIs fetch them from there. This module plays that role so lessons 03-04
// run offline. Run this file alone to start it and print a test token.
import { createServer, type Server } from 'node:http'
import { SignJWT, exportJWK, generateKeyPair } from 'jose'

export const ISSUER_PORT = 4100
export const ISSUER = `http://localhost:${ISSUER_PORT}/`
export const AUDIENCE = 'https://api.hello-auth0.local'
const KEY_ID = 'lesson-key-1'

const { privateKey, publicKey } = await generateKeyPair('RS256')
const jwks = { keys: [{ ...(await exportJWK(publicKey)), kid: KEY_ID, alg: 'RS256', use: 'sig' }] }

// What Auth0 does when a user logs in: sign a token for them.
export const issueToken = (sub: string, scope: string) =>
  new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256', kid: KEY_ID }) // kid tells the API which key to use
    .setSubject(sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey)

export const startIssuer = () =>
  new Promise<Server>((resolve) => {
    const server = createServer((request, response) => {
      if (request.url === '/.well-known/jwks.json') {
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(jwks))
        return
      }
      response.writeHead(404).end()
    })
    server.listen(ISSUER_PORT, () => resolve(server))
  })

const runDirectly = import.meta.url === `file://${process.argv[1]}`
if (runDirectly) {
  const server = await startIssuer()
  console.log(`Fake issuer at ${ISSUER}`)
  console.log(`Public keys: ${ISSUER}.well-known/jwks.json\n`)
  console.log('JWKS:', JSON.stringify(jwks, null, 2), '\n')
  console.log('A token for auth0|user-123:\n', await issueToken('auth0|user-123', 'read:exports'))
  server.close()
}
