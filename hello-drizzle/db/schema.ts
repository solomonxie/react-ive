// The schema file drizzle-kit reads (see drizzle.config.ts). Keeping tables in
// one module is how real apps do it: queries import from here, and
// `npm run generate` diffs this file against past migrations.
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  done: boolean('done').notNull().default(false),
  priority: integer('priority').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Types for a row you read and a row you insert, straight from the table.
export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
