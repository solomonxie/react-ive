// Filter, update, delete — where clauses, ordering and `returning`.
// Goal: read and change rows the way you'd write SQL, with typed helpers
// (eq, gt, and, or, like...) instead of strings.
//
// Run:  npm run lesson -- 03

import { PGlite } from '@electric-sql/pglite'
import { and, asc, desc, eq, gt, ilike, isNull, or, sql } from 'drizzle-orm'
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/pglite'

const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  priceCents: integer('price_cents').notNull(),
  stock: integer('stock'),
})

const client = new PGlite()
const db = drizzle({ client })
await db.execute(sql`
  create table products (
    id serial primary key, name text not null, category text not null,
    price_cents integer not null, stock integer
  )
`)
await db.insert(products).values([
  { name: 'Keyboard', category: 'desk', priceCents: 8900, stock: 12 },
  { name: 'Mouse', category: 'desk', priceCents: 2900, stock: 0 },
  { name: 'Monitor', category: 'desk', priceCents: 24900, stock: 3 },
  { name: 'Coffee mug', category: 'kitchen', priceCents: 1200, stock: null },
  { name: 'Kettle', category: 'kitchen', priceCents: 4500, stock: 7 },
])

// where + eq: `eq(products.category, 'desk')` compiles to category = $1.
const desk = await db.select().from(products).where(eq(products.category, 'desk'))
console.log('desk items:', desk.map((p) => p.name))

// Combine conditions with and/or, sort, and limit.
const pricyInStock = await db
  .select({ name: products.name, priceCents: products.priceCents })
  .from(products)
  .where(and(gt(products.priceCents, 3000), gt(products.stock, 0)))
  .orderBy(desc(products.priceCents))
  .limit(2)
console.log('two priciest in stock:', pricyInStock)

const search = await db
  .select({ name: products.name })
  .from(products)
  .where(or(ilike(products.name, '%k%'), isNull(products.stock)))
  .orderBy(asc(products.name))
console.log('has a "k" or unknown stock:', search)

// update ... set ... where. `returning()` gives back the changed rows, so
// you don't need a second select. sql`` lets you drop to raw SQL for one bit.
const restocked = await db
  .update(products)
  .set({ stock: sql`${products.stock} + 10` })
  .where(eq(products.stock, 0))
  .returning({ name: products.name, stock: products.stock })
console.log('restocked:', restocked)

// delete ... where. Forgetting `where` deletes every row, same as in SQL.
const removed = await db.delete(products).where(eq(products.category, 'kitchen')).returning()
console.log('removed:', removed.map((p) => p.name))

const [{ count }] = (await db.select({ count: sql<number>`count(*)::int` }).from(products)) as [
  { count: number },
]
console.log('rows left:', count)

await client.close()
