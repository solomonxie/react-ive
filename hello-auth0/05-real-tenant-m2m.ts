// Lesson 05: a real Auth0 tenant, machine-to-machine (client credentials).
// Services talk to each other this way: no user, the service trades its
// client id + secret for an access token, then calls the API with it.
// Same verify code as lesson 04, but the keys now come from Auth0.
//
// Needs a free Auth0 tenant and a .env file (see README, "Real tenant setup").
import { createRemoteJWKSet, decodeJwt, jwtVerify } from 'jose'

process.loadEnvFile?.('.env')
const { AUTH0_DOMAIN, AUTH0_AUDIENCE, AUTH0_M2M_CLIENT_ID, AUTH0_M2M_CLIENT_SECRET } = process.env
if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE || !AUTH0_M2M_CLIENT_ID || !AUTH0_M2M_CLIENT_SECRET) {
  console.error('Missing values in .env. Copy .env.example to .env and fill it in (README explains where each comes from).')
  process.exit(1)
}

const issuer = `https://${AUTH0_DOMAIN}/`

// 1. Trade client credentials for a token.
const response = await fetch(`${issuer}oauth/token`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: AUTH0_M2M_CLIENT_ID,
    client_secret: AUTH0_M2M_CLIENT_SECRET,
    audience: AUTH0_AUDIENCE,
  }),
})
if (!response.ok) {
  console.error('Token request failed:', response.status, await response.text())
  process.exit(1)
}
const { access_token: accessToken, expires_in: expiresIn } = (await response.json()) as {
  access_token: string
  expires_in: number
}
console.log(`Got a token, valid for ${expiresIn}s`)

// 2. Look inside (no trust yet).
const claims = decodeJwt(accessToken)
console.log('Claims:', { iss: claims.iss, sub: claims.sub, aud: claims.aud, scope: claims.scope })
console.log('  sub ends in "@clients": a machine, not a person')

// 3. Verify it the way your API would, with keys from the tenant's JWKS.
const jwks = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`))
const { payload } = await jwtVerify(accessToken, jwks, { issuer, audience: AUDIENCE_OR_EXIT() })
console.log('✅ Verified against', `${issuer}.well-known/jwks.json`, '→ sub', payload.sub)

function AUDIENCE_OR_EXIT() {
  return AUTH0_AUDIENCE as string
}
