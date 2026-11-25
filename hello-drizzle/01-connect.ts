// Connect — open a Postgres database and run raw SQL through Drizzle.
// Goal: see the two pieces every Drizzle app has: a driver (the real database
// client) and the `db` object Drizzle wraps around it.
//
// Run:  cd hello-drizzle && npm install
//       npm run lesson -- 01

import { PGlite } from '@electric-sql/pglite'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'

// PGlite is real Postgres compiled to WebAssembly, running inside this Node
// process. No server to install; the data lives in memory and dies with the
// process. It's a handy trick for local dev and tests.
const client = new PGlite()

// Drizzle doesn't open connections itself: you hand it a client. Swap PGlite
// for a `pg` Pool and `drizzle-orm/node-postgres` and the rest of your code
// stays the same.
const db = drizzle({ client })

// `sql` is a tagged template. Values in ${} become query parameters ($1, $2),
// never pasted-in strings, so they're safe from SQL injection.
const name = 'Drizzle'
const result = await db.execute(sql`select 'hello ' || ${name} as greeting, version() as pg`)

console.log(result.rows[0])

await client.close()
