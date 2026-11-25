// Migrations — let drizzle-kit write the CREATE TABLE for you.
// Goal: the real-app workflow. Tables live in db/schema.ts, `npm run generate`
// writes SQL migration files into db/migrations/, and `migrate()` applies
// them at startup. No more hand-written `create table`.
//
// Run:  npm run generate        (once, and again after each schema change)
//       npm run lesson -- 07
//
// Try it: add a column to db/schema.ts (say `notes: text('notes')`), run
// `npm run generate` again, and look at the new file in db/migrations/.

import { existsSync } from 'node:fs'

import { PGlite } from '@electric-sql/pglite'
import { desc, eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'

import { type NewTodo, todos } from './db/schema'

const migrationsFolder = './db/migrations'
if (!existsSync(migrationsFolder)) {
  console.error('No migrations yet. Run `npm run generate` first.')
  process.exit(1)
}

const client = new PGlite()
const db = drizzle({ client })

// Applies every migration not yet recorded in the __drizzle_migrations table.
// This is a common way to set up in-memory PGlite databases.
await migrate(db, { migrationsFolder })

const newTodos: NewTodo[] = [
  { title: 'Learn Drizzle', priority: 2 },
  { title: 'Learn Fastify', priority: 1 },
  { title: 'Water the plants' },
]
await db.insert(todos).values(newTodos)
await db.update(todos).set({ done: true }).where(eq(todos.title, 'Learn Drizzle'))

console.table(await db.select().from(todos).orderBy(desc(todos.priority)))

await client.close()
