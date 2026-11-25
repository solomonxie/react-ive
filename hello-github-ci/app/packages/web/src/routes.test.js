import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('every generated route starts with a slash', () => {
  const routes = JSON.parse(readFileSync(new URL('../generated/routes.json', import.meta.url), 'utf8'))
  assert.ok(routes.length > 0)
  for (const route of routes) {
    assert.match(route.path, /^\/[a-z0-9-]+$/)
  }
})
