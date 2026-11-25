// Testing — test the API end to end with app.inject() and node:test.
// Goal: each test builds its own app (and its own in-memory database) from
// lesson 07's buildApp(), sends requests with inject(), and checks the
// status and JSON. No server, no port, no mocks, and it runs fast.
// (Many projects use Jest instead, but the inject() pattern is the same.)
//
// Run:  npm run lesson -- 08

import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'

import { buildApp } from './07-notes-app'

let app: Awaited<ReturnType<typeof buildApp>>

beforeEach(async () => {
  app = await buildApp()
})

afterEach(async () => {
  await app.close()
})

test('creates a note and lists it', async () => {
  const created = await app.inject({ method: 'POST', url: '/notes', payload: { text: 'buy milk' } })
  assert.equal(created.statusCode, 201)
  assert.equal(created.json().text, 'buy milk')
  assert.equal(created.json().done, false)

  const list = await app.inject({ method: 'GET', url: '/notes' })
  assert.deepEqual(
    list.json().map((n: { text: string }) => n.text),
    ['buy milk'],
  )
})

test('rejects an empty note with 400', async () => {
  const res = await app.inject({ method: 'POST', url: '/notes', payload: { text: '   ' } })
  assert.equal(res.statusCode, 400)
})

test('marks a note done and filters by done', async () => {
  await app.inject({ method: 'POST', url: '/notes', payload: { text: 'one' } })
  await app.inject({ method: 'POST', url: '/notes', payload: { text: 'two' } })

  const patched = await app.inject({ method: 'PATCH', url: '/notes/1', payload: { done: true } })
  assert.equal(patched.statusCode, 200)
  assert.equal(patched.json().done, true)

  const done = await app.inject({ method: 'GET', url: '/notes?done=true' })
  assert.deepEqual(
    done.json().map((n: { text: string }) => n.text),
    ['one'],
  )
})

test('returns 404 for a note that does not exist', async () => {
  const res = await app.inject({ method: 'DELETE', url: '/notes/42' })
  assert.equal(res.statusCode, 404)
  assert.deepEqual(res.json(), { error: 'note not found' })
})

test('each test starts with an empty database', async () => {
  const res = await app.inject({ method: 'GET', url: '/notes' })
  assert.deepEqual(res.json(), [])
})
