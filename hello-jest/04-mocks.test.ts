// Lesson 04: mocks.
//
// Run: npm run lesson -- 04
//
// A mock is a stand-in you control. Use one to (a) avoid slow or unsafe things
// (network, clock, database) and (b) check that your code called something.
//
// In a real app: jest.fn, jest.spyOn and jest.mock are all used. A hook test
// might mock two modules with jest.mock and flip variables named mock* per test.

import { greeting } from '@src/greeting'
import { sendWelcome } from '@src/mailer'

// ---------------------------------------------------------------------------
// 1. jest.fn(): a fake function that records how it was called.
// ---------------------------------------------------------------------------
describe('jest.fn', () => {
  it('records calls', async () => {
    const send = jest.fn().mockResolvedValue(undefined)

    await sendWelcome(send, 'ada@example.com')

    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('ada@example.com', 'Welcome, ada@example.com!')
  })

  it('can return different values per call', () => {
    const next = jest.fn().mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(99)
    expect([next(), next(), next(), next()]).toEqual([1, 2, 99, 99])
  })

  // A common config has clearMocks: true, so calls from the previous
  // test are gone here. See jest.config.cjs.
  it('starts with no calls', () => {
    const fn = jest.fn()
    expect(fn).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// 2. jest.spyOn(): watch (and optionally replace) a method on a real object.
// ---------------------------------------------------------------------------
describe('jest.spyOn', () => {
  afterEach(() => {
    jest.restoreAllMocks() // put the real implementations back
  })

  it('replaces Math.random for a test', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(Math.random()).toBe(0.5)
  })

  it('silences and checks console.error', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    console.error('oops')
    expect(spy).toHaveBeenCalledWith('oops')
  })
})

// ---------------------------------------------------------------------------
// 3. jest.mock(): replace a whole module for the file.
//    Jest hoists this call above the imports, so greeting.ts already receives
//    the fake clock. The factory returns the fake module.
// ---------------------------------------------------------------------------
// Variables used inside the factory must start with "mock" (Jest's rule, since
// the factory is hoisted above normal variable declarations).
let mockNow = 0
jest.mock('@src/clock', () => ({
  now: () => mockNow,
}))

describe('jest.mock of a module', () => {
  it('uses the fake clock in the morning', () => {
    mockNow = Date.UTC(2026, 0, 1, 9)
    expect(greeting('Ada')).toBe('Good morning, Ada')
  })

  it('uses the fake clock in the afternoon', () => {
    mockNow = Date.UTC(2026, 0, 1, 15)
    expect(greeting('Ada')).toBe('Good afternoon, Ada')
  })
})

// ---------------------------------------------------------------------------
// When NOT to mock
// ---------------------------------------------------------------------------
// - Do not mock the thing you are testing.
// - Do not mock simple pure helpers; just call them. A test that mocks every
//   dependency only proves your mocks agree with your code.
// - Prefer passing a fake in (like `send` above) over jest.mock when you can.
// - Mock at the edges: network, time, randomness, storage, heavy providers.
// - Reviewing tip: if a test has more mock setup than assertions, ask what
//   real behavior it is actually protecting.
