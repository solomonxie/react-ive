// Transactions — several writes that all succeed or all roll back.
// Goal: use db.transaction for multi-step changes, and see a failed step
// undo the earlier ones.
//
// Run:  npm run lesson -- 06

import { PGlite } from '@electric-sql/pglite'
import { eq, sql } from 'drizzle-orm'
import { check, integer, pgTable, text } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/pglite'

const accounts = pgTable(
  'accounts',
  {
    owner: text('owner').primaryKey(),
    balance: integer('balance').notNull(),
  },
  // The third argument holds table-level extras: indexes, checks, composite keys.
  (t) => [check('balance_not_negative', sql`${t.balance} >= 0`)],
)

const client = new PGlite()
const db = drizzle({ client })
await db.execute(sql`
  create table accounts (
    owner text primary key,
    balance integer not null constraint balance_not_negative check (balance >= 0)
  )
`)
await db.insert(accounts).values([
  { owner: 'alice', balance: 100 },
  { owner: 'bob', balance: 20 },
])

// Inside the callback, use `tx`, not `db`, so every query runs in the same
// transaction. If the callback throws, Drizzle rolls everything back.
async function transfer(from: string, to: string, amount: number) {
  await db.transaction(async (tx) => {
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} + ${amount}` })
      .where(eq(accounts.owner, to))
    // This one breaks the check constraint when `from` can't afford it.
    await tx
      .update(accounts)
      .set({ balance: sql`${accounts.balance} - ${amount}` })
      .where(eq(accounts.owner, from))
  })
}

const balances = () => db.select().from(accounts).orderBy(accounts.owner)

await transfer('alice', 'bob', 30)
console.log('after alice -> bob 30:', await balances())

try {
  await transfer('bob', 'alice', 500)
} catch (error) {
  // Drizzle wraps the driver error; the Postgres message is on `cause`.
  const cause = (error as Error).cause as Error | undefined
  console.log('transfer failed:', cause?.message ?? (error as Error).message)
}
// Alice was credited first, but the whole transaction rolled back.
console.log('after the failed transfer:', await balances())

// You can also bail out on purpose with tx.rollback().
await db
  .transaction(async (tx) => {
    await tx.delete(accounts)
    tx.rollback()
  })
  .catch(() => console.log('rolled back on purpose; rows are still there:'))
console.log(await balances())

await client.close()
