// Lesson 01: what a JWT is.
// An access token from Auth0 is a JWT: three base64url parts joined by dots,
// header.payload.signature. Anyone can read the first two; only the issuer
// can make a valid signature. Here we build one by hand to see the pieces.
import { createHmac } from 'node:crypto'

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url')

const header = { alg: 'HS256', typ: 'JWT' }
const payload = {
  sub: 'auth0|user-123', // who the token is about
  iss: 'https://example.us.auth0.com/', // who issued it
  aud: 'https://api.example.com', // which API it's for
  iat: Math.floor(Date.now() / 1000), // issued at (seconds)
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // expires in an hour
}

const secret = 'only-the-issuer-knows-this'
const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`
const signature = createHmac('sha256', secret).update(unsigned).digest('base64url')
const token = `${unsigned}.${signature}`

console.log('Token:\n', token, '\n')

// Reading a JWT needs no key at all: it's just base64url JSON.
const [rawHeader, rawPayload] = token.split('.')
console.log('Header :', JSON.parse(Buffer.from(rawHeader!, 'base64url').toString()))
console.log('Payload:', JSON.parse(Buffer.from(rawPayload!, 'base64url').toString()))

// Trusting it is different: recompute the signature with the key.
const tampered = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify({ ...payload, sub: 'auth0|admin' }))}`
const check = (part: string, sig: string) =>
  createHmac('sha256', secret).update(part).digest('base64url') === sig
console.log('\nOriginal signature valid?', check(unsigned, signature))
console.log('Tampered payload valid? ', check(tampered, signature))
console.log('\nTakeaway: never trust a JWT you only decoded. Verify the signature.')
