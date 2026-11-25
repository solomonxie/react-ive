// Lesson 05: how Jest is configured, and what that means for your tests.
//
// Run: npm run lesson -- 05
// Open jest.config.cjs next to this file; the comments there map each option
// to the kind of shared base config a large app uses.
//
// 1. Transform: Jest only understands plain JavaScript. `transform` tells it
//    how to turn .ts/.tsx into JS. Large apps often use @swc/jest (fast, but it
//    only strips types and never type-checks). That is why such apps have a
//    separate `tsc` step. A test with a type error can still pass in Jest!
//
// 2. moduleNameMapper: maps import paths to files, like tsconfig "paths".
//    Here `@src/*` -> `src/*`. Large apps often generate the same kind of map
//    from tsconfig paths (so `@features/...` and `@components/...` work).
//    It also maps css, svg and images to tiny stub files (usually kept in a
//    __mocks__ folder).
//
// 3. setupFilesAfterEnv: a file that runs before each test file. That is
//    where `@testing-library/jest-dom` gets registered.
//
// 4. testEnvironment: "node" or "jsdom". jsdom fakes a browser (window,
//    document), needed for React components. A typical unit config
//    defaults to jsdom. Node is faster for pure logic and backend code; a
//    file can override with the docblock in 05-config-node-env.test.ts.

import { slugify } from '@src/slug' // resolved by moduleNameMapper

test('alias import works', () => {
  expect(slugify('  Hello, Lighthouse World! ')).toBe('hello-lighthouse-world')
})

test('typescript syntax was stripped by swc', () => {
  // `as` and type annotations are gone at runtime.
  const value = 'abc' as string
  const length: number = value.length
  expect(length).toBe(3)
})

// jsdom is the default env in this repo, so browser globals exist.
test('jsdom provides window and document', () => {
  expect(typeof window).toBe('object')
  document.body.innerHTML = '<p id="x">hi</p>'
  expect(document.getElementById('x')?.textContent).toBe('hi')
})

// Type checking is separate. Uncomment the next line, then run `npm test`
// (passes) and `npm run typecheck` (fails). That is the swc trade-off.
// const broken: number = 'not a number'

test('setup file registered jest-dom matchers', () => {
  const el = document.createElement('button')
  el.disabled = true
  expect(el).toBeDisabled() // comes from jest.setup.ts
})
