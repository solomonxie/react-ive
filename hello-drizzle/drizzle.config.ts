import { defineConfig } from 'drizzle-kit'

// Real projects keep a config like this per service. drizzle-kit
// 1.0 names each migration folder with a timestamp, so no prefix option is needed.
export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
})
