# Drizzle: a progressive learning path

Drizzle is a TypeScript ORM: you describe your tables in TypeScript, and every
query you build from them is checked by the compiler. It stays close to SQL,
so if you can read a `select ... join ... where`, you can read Drizzle.

It's a common pick for backend services, with Postgres in production and
PGlite in memory for local runs and tests. These
lessons use PGlite too, so there's no database to install.

## Setup

```sh
cd hello-drizzle
npm install
```

## How to run a lesson

```sh
npm run lesson -- 01
make lesson N=05
```

Lesson 07 needs migrations first: run `npm run generate` once before it.

## Lessons

- `01-connect.ts`: open an in-memory Postgres (PGlite), wrap it with
  `drizzle()`, run raw SQL safely with the `sql` tag
- `02-schema-insert-select.ts`: define a table with `pgTable`, insert rows,
  select all or some columns, peek at the SQL with `.toSQL()`
- `03-filter-update-delete.ts`: `where` with `eq`, `gt`, `and`, `or`, `ilike`,
  `isNull`; `orderBy`, `limit`; `update` and `delete` with `returning()`
- `04-joins.ts`: foreign keys with `references()`, inner and left joins (and
  how the left join's missing side is typed as nullable), `groupBy` with
  `count`
- `05-relational-queries.ts`: `defineRelations` plus `db.query...findMany`
  with `with`, to get nested objects (users → posts → comments) instead of
  flat join rows
- `06-transactions.ts`: `db.transaction` with `tx`, automatic rollback when a
  step fails, and `tx.rollback()` on purpose
- `07-migrations.ts`: the real-app setup, with tables in `db/schema.ts`,
  `drizzle-kit generate` writing SQL files, and `migrate()` applying them at
  startup; `$inferSelect` and `$inferInsert` row types

## Notes

- This uses Drizzle 1.0 beta (`drizzle-orm@1.0.0-beta.22`), a recent
  version. Relations use the new `defineRelations` API and `db.query` takes
  object-style `where` and `orderBy`; older tutorials show `relations()` and
  callback filters, which belong to 0.x.
- `db.execute` runs one SQL statement. To run a script with several statements
  on PGlite, use `client.exec(...)` (lessons 04 and 05).
