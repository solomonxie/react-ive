// Lesson 02: sign and verify with `jose`, and the checks that matter.
// Auth0 signs with RS256: a private key signs, a public key verifies, so an
// API can check tokens without holding any secret.
import { SignJWT, generateKeyPair, jwtVerify, errors } from 'jose'

const ISSUER = 'https://example.us.auth0.com/'
const AUDIENCE = 'https://api.example.com'

const { privateKey, publicKey } = await generateKeyPair('RS256')

const makeToken = (overrides: { audience?: string; expiresIn?: string } = {}) =>
  new SignJWT({ scope: 'read:exports' })
    .setProtectedHeader({ alg: 'RS256' })
    .setSubject('auth0|user-123')
    .setIssuer(ISSUER)
    .setAudience(overrides.audience ?? AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(overrides.expiresIn ?? '1h')
    .sign(privateKey)

const verify = async (label: string, token: string) => {
  try {
    const { payload } = await jwtVerify(token, publicKey, { issuer: ISSUER, audience: AUDIENCE })
    console.log(`✅ ${label}: sub=${payload.sub} scope=${payload.scope}`)
  } catch (error) {
    const reason = error instanceof errors.JOSEError ? error.code : String(error)
    console.log(`❌ ${label}: ${reason}`)
  }
}

await verify('good token', await makeToken())
await verify('token for another API', await makeToken({ audience: 'https://other.example.com' }))
await verify('expired token', await makeToken({ expiresIn: '-1m' }))

// A token signed by someone else's key fails even if every claim looks right.
const attacker = await generateKeyPair('RS256')
const forged = await new SignJWT({}).setProtectedHeader({ alg: 'RS256' })
  .setIssuer(ISSUER).setAudience(AUDIENCE).setExpirationTime('1h').sign(attacker.privateKey)
await verify('forged signature', forged)

console.log('\nTakeaway: always pass issuer and audience to jwtVerify, not just the key.')
