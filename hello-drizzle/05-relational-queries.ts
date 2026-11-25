// Relational queries — fetch nested objects with `db.query` instead of joins.
// Goal: declare relations once with defineRelations, then ask for "users with
// their posts and each post's comments" and get back nested, typed objects.
//
// Run:  npm run lesson -- 05

import { PGlite } from '@electric-sql/pglite'
import { defineRelations } from 'drizzle-orm'
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/pglite'

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
})
const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  authorId: integer('author_id').notNull(),
})
const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  body: text('body').notNull(),
  postId: integer('post_id').notNull(),
})

// Relations live on top of the tables. They don't change the database at
// all; they only tell `db.query` how tables connect.
// r.one = "this row points at one row there", r.many = "many rows point here".
const relations = defineRelations({ users, posts, comments }, (r) => ({
  users: {
    posts: r.many.posts(),
  },
  posts: {
    author: r.one.users({ from: r.posts.authorId, to: r.users.id }),
    comments: r.many.comments(),
  },
  comments: {
    post: r.one.posts({ from: r.comments.postId, to: r.posts.id }),
  },
}))

const client = new PGlite()
// Passing `relations` turns on db.query.<table>.
const db = drizzle({ client, relations })
// db.execute runs one statement; PGlite's exec() runs a whole SQL script.
await client.exec(`
  create table users (id serial primary key, name text not null);
  create table posts (id serial primary key, title text not null, author_id integer not null);
  create table comments (id serial primary key, body text not null, post_id integer not null);
`)

const [ada, grace] = await db.insert(users).values([{ name: 'Ada' }, { name: 'Grace' }]).returning()
const [p1, p2] = await db
  .insert(posts)
  .values([
    { title: 'Notes on the engine', authorId: ada!.id },
    { title: 'Finding the first bug', authorId: grace!.id },
  ])
  .returning()
await db.insert(comments).values([
  { body: 'Ahead of its time', postId: p1!.id },
  { body: 'It was a moth!', postId: p2!.id },
  { body: 'Classic', postId: p2!.id },
])

// `with` says which relations to load. Drizzle builds one SQL query and
// shapes the result into nested objects.
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: {
      columns: { title: true },
      with: { comments: { columns: { body: true } } },
    },
  },
  orderBy: { name: 'asc' },
})
console.dir(usersWithPosts, { depth: null })

// findFirst + where (object syntax) + going "up" a relation.
const comment = await db.query.comments.findFirst({
  where: { body: { like: '%moth%' } },
  with: { post: { with: { author: true } } },
})
console.log(`"${comment?.body}" is on "${comment?.post?.title}" by ${comment?.post?.author?.name}`)

await client.close()
