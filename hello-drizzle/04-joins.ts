// Joins — foreign keys and SQL-style joins across two tables.
// Goal: link tables with `references()`, then join them the way you would in
// SQL, and see how Drizzle types the nullable side of a left join.
//
// Run:  npm run lesson -- 04

import { PGlite } from '@electric-sql/pglite'
import { count, eq } from 'drizzle-orm'
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/pglite'

const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
})

// references() declares the foreign key: posts.author_id -> authors.id.
const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authorId: integer('author_id')
    .notNull()
    .references(() => authors.id, { onDelete: 'cascade' }),
})

const client = new PGlite()
const db = drizzle({ client })
// db.execute runs one statement; PGlite's exec() runs a whole SQL script.
await client.exec(`
  create table authors (id serial primary key, name text not null);
  create table posts (
    id serial primary key, title text not null,
    author_id integer not null references authors(id) on delete cascade
  );
`)

const [ada, grace, linus] = await db
  .insert(authors)
  .values([{ name: 'Ada' }, { name: 'Grace' }, { name: 'Linus' }])
  .returning()
await db.insert(posts).values([
  { title: 'Notes on the engine', authorId: ada!.id },
  { title: 'Poetical science', authorId: ada!.id },
  { title: 'Finding the first bug', authorId: grace!.id },
])

// Inner join: only authors who have posts. The result is flat rows you shape
// yourself in the select.
const withPosts = await db
  .select({ author: authors.name, post: posts.title })
  .from(posts)
  .innerJoin(authors, eq(posts.authorId, authors.id))
console.log('inner join:', withPosts)

// Left join: every author, posts or not. Hover `everyone`: `post` is typed
// string | null, because Drizzle knows the right side may be missing.
const everyone = await db
  .select({ author: authors.name, post: posts.title })
  .from(authors)
  .leftJoin(posts, eq(posts.authorId, authors.id))
console.log('left join:', everyone)

// Group by + aggregate: post count per author.
const postCounts = await db
  .select({ author: authors.name, posts: count(posts.id) })
  .from(authors)
  .leftJoin(posts, eq(posts.authorId, authors.id))
  .groupBy(authors.name)
  .orderBy(authors.name)
console.log('posts per author:', postCounts)

// The foreign key does real work: deleting Ada cascades to her posts.
await db.delete(authors).where(eq(authors.id, ada!.id))
console.log('posts left after deleting Ada:', await db.select({ title: posts.title }).from(posts))
console.log('Linus is still here:', linus!.name)

await client.close()
