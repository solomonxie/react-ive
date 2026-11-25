// Schema, insert, select — describe a table in TypeScript and query it.
// Goal: the core idea of Drizzle: the table definition is a TypeScript value,
// and every query you build from it is fully typed.
//
// Run:  npm run lesson -- 02

import { PGlite } from '@electric-sql/pglite'
import { sql } from 'drizzle-orm'
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/pglite'

// One pgTable call = one Postgres table. The first argument of each column
// is the column's name in the database; the object key is its name in TS.
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'), // nullable: the TS type becomes number | null
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

const client = new PGlite()
const db = drizzle({ client })

// Drizzle can generate this SQL for you (lesson 07, migrations). For now we
// create the table by hand so the lesson stays about querying.
await db.execute(sql`
  create table users (
    id serial primary key,
    name text not null,
    email text not null unique,
    age integer,
    created_at timestamp not null default now()
  )
`)

// insert(...).values(...) checks the object against the table: leave out
// `name` or misspell a key and TypeScript complains before you run anything.
await db.insert(users).values([
  { name: 'Ada', email: 'ada@example.com', age: 36 },
  { name: 'Linus', email: 'linus@example.com', age: null },
  { name: 'Grace', email: 'grace@example.com', age: 45 },
])

// select().from(table) reads every column. Hover `allUsers` in your editor:
// it's { id: number; name: string; email: string; age: number | null; createdAt: Date }[]
const allUsers = await db.select().from(users)
console.log('all users:', allUsers)

// Pick only some columns, and rename them on the way out.
const names = await db.select({ userName: users.name, mail: users.email }).from(users)
console.log('just names:', names)

// .toSQL() shows what Drizzle sends to Postgres, without running it.
console.log(db.select({ name: users.name }).from(users).toSQL())

await client.close()
