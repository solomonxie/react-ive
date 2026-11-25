import assert from 'node:assert/strict'
import { test } from 'node:test'
import { slugify } from './index.js'

test('slugify lowercases and joins words with dashes', () => {
  assert.equal(slugify('  Hello, CI World! '), 'hello-ci-world')
})
