// Lesson 06: a user logs in in the browser and calls your API.
// This is the usual single-page-app flow: the page uses @auth0/auth0-spa-js to
// send the user to Auth0's login page, gets an access token back, and sends
// it as a bearer token to the API. The API half is lesson 04's code against a real tenant.
//
// Needs the SPA app from the README ("Real tenant setup"). Then open
// http://localhost:3000 and log in.
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRemoteJWKSet, jwtVerify } from 'jose'

process.loadEnvFile?.('.env')
const { AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_SPA_CLIENT_ID } = process.env
if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE || !AUTH0_SPA_CLIENT_ID) {
  console.error('Missing AUTH0_DOMAIN, AUTH0_AUDIENCE or AUTH0_SPA_CLIENT_ID in .env (see README).')
  process.exit(1)
}

const PORT = 3000
const issuer = `https://${AUTH0_DOMAIN}/`
const jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`))

// The page only gets public settings; never put a client secret in a browser.
const page = readFileSync(new URL('./06-spa-login.html', import.meta.url), 'utf8')
  .replace('__AUTH0_DOMAIN__', AUTH0_DOMAIN)
  .replace('__AUTH0_CLIENT_ID__', AUTH0_SPA_CLIENT_ID)
  .replace('__AUTH0_AUDIENCE__', AUTH0_AUDIENCE)

const sendJson = (response: import('node:http').ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { 'content-type': 'application/json' })
  response.end(JSON.stringify(body))
}

createServer(async (request, response) => {
  if (request.url === '/api/me') {
    const token = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
    if (!token) {
      sendJson(response, 401, { error: 'missing bearer token' })
      return
    }
    try {
      const { payload } = await jwtVerify(token, jwks, { issuer, audience: AUTH0_AUDIENCE })
      sendJson(response, 200, { sub: payload.sub, scope: payload.scope ?? null, expiresAt: payload.exp })
    } catch (error) {
      sendJson(response, 401, { error: String(error) })
    }
    return
  }
  response.writeHead(200, { 'content-type': 'text/html' })
  response.end(page)
}).listen(PORT, () => console.log(`Open http://localhost:${PORT} and log in. Ctrl+C to stop.`))
