// One Schema, Two Sides — a shared schema imported by an API and a client.
// Goal: see why a schema lives in its own package, and what each side does with it.
//
// Three files sit next to this one, the same way lesson 08 used 08-math-utils.ts:
//   - 13-shared-schema.ts  the shared package: schemas and inferred types only
//   - 13-api.ts            the API: validates unknown input, encodes responses
//   - 13-client.ts         the frontend: checks before sending, decodes replies
//
// In a monorepo the shared file is its own package that both the API and the
// frontend depend on. Change a rule there and both sides pick it up; change a
// field and TypeScript flags every place on either side that needs updating.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 13

import { startApi } from './13-api'
import { saveGrouping } from './13-client'
import type { PageGrouping } from './13-shared-schema'

const server = await startApi()
const address = server.address()
const baseUrl = typeof address === 'object' && address ? `http://127.0.0.1:${address.port}` : ''

const good: PageGrouping = {
  name: 'Funnels',
  groups: [
    { name: 'Blog', urlContains: '/blog' },
    { name: 'Product pages', urlContains: '/products/' },
  ],
}

// Typechecks fine (two strings), but breaks the shared "unique names" rule.
const duplicate: PageGrouping = {
  name: 'Oops',
  groups: [
    { name: 'Blog', urlContains: '/blog' },
    { name: 'blog ', urlContains: '/articles' },
  ],
}

console.log('1. a valid grouping:')
const saved = await saveGrouping(baseUrl, good)
console.dir(saved, { depth: null })
if (saved.ok) {
  console.log('   updatedAt is a', saved.grouping.updatedAt.constructor.name, 'again on the client')
}

console.log('\n2. a duplicate name, caught by the client before any request:')
console.log(await saveGrouping(baseUrl, duplicate))

console.log('\n3. the same mistake with the client check skipped (think curl):')
console.log(await saveGrouping(baseUrl, duplicate, true))

server.close()
