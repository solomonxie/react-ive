// Lesson 01: your first test.
//
// A test file is just a file ending in .test.ts. Jest finds it, runs every
// test() inside, and reports which ones threw. A test passes when it finishes
// without throwing. expect(...) is how you throw on purpose when something is
// wrong.
//
// Run just this file:  npm run lesson -- 01
//
// In a real app: same thing. In a pnpm workspace,
// `pnpm --filter <app> test <path>` runs one file. `it` and `test` are the
// same function; many codebases mostly write `it("does x", ...)`.

function add(a: number, b: number): number {
  return a + b
}

test('adds two numbers', () => {
  expect(add(1, 2)).toBe(3)
})

// toBe uses Object.is, so it is for primitives (numbers, strings, booleans).
test('toBe compares primitives', () => {
  expect('hello'.toUpperCase()).toBe('HELLO')
  expect(2 + 2).not.toBe(5) // .not flips any matcher
})

// Objects and arrays are compared by reference with toBe, so two separate
// {a: 1} are NOT equal. Use toEqual to compare by content. You will see
// toEqual all over real-world test suites.
test('toEqual compares by content', () => {
  const user = { id: 1, name: 'Ada' }
  expect(user).not.toBe({ id: 1, name: 'Ada' })
  expect(user).toEqual({ id: 1, name: 'Ada' })
})

// toMatchObject checks a subset, handy when the object has extra fields
// you do not care about.
test('toMatchObject checks only some fields', () => {
  const row = { id: 7, name: 'Ada', createdAt: '2026-01-01' }
  expect(row).toMatchObject({ name: 'Ada' })
})

// A few matchers you will meet most often.
test('common matchers', () => {
  expect([1, 2, 3]).toContain(2)
  expect([1, 2, 3]).toHaveLength(3)
  expect('lighthouse').toMatch(/house$/)
  expect(null).toBeNull()
  expect(undefined).toBeUndefined()
  expect('x').toBeTruthy()
  expect(0.1 + 0.2).toBeCloseTo(0.3) // floats: never use toBe
})

// To check that code throws, wrap the call in a function. If you call it
// directly, the error escapes before expect can look at it.
test('toThrow expects an error', () => {
  const boom = () => {
    throw new Error('bad input')
  }
  expect(boom).toThrow('bad input')
})

// Try it: change a 3 to a 4 above and run again to see how Jest reports a
// failure (expected vs received, with the line).
