// Lesson 03: async code and fake timers.
//
// Run: npm run lesson -- 03
//
// In a real app: async tests are everywhere (API calls, hooks). Fake timers show up
// for debounce, polling and toasts.

function wait(ms: number): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve('done'), ms))
}

async function fetchUser(id: number): Promise<{ id: number; name: string }> {
  if (id < 0) throw new Error('invalid id')
  return { id, name: `user-${id}` }
}

describe('async tests', () => {
  // Rule 1: if the test is async, return/await the promise. Otherwise Jest
  // finishes before the promise settles and the test "passes" for nothing.
  it('awaits a promise', async () => {
    const user = await fetchUser(1)
    expect(user).toEqual({ id: 1, name: 'user-1' })
  })

  // resolves/rejects unwrap the promise for you. Note the await in front of expect.
  it('uses resolves', async () => {
    await expect(fetchUser(2)).resolves.toMatchObject({ id: 2 })
  })

  it('uses rejects for errors', async () => {
    await expect(fetchUser(-1)).rejects.toThrow('invalid id')
  })

  // To check a thrown error's details, catch it and compare. Keep the expect
  // outside the catch so the test cannot pass without reaching it.
  it('inspects an error', async () => {
    const error = await fetchUser(-1).catch((e: Error) => e)
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('invalid id')
  })
})

describe('fake timers', () => {
  // Real timers would make this test really wait 5 seconds. Fake timers let
  // us move the clock by hand.
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers() // always restore, or later tests inherit fake time
  })

  it('advances time instantly', async () => {
    const promise = wait(5000)
    // Async version flushes promise callbacks too. Prefer it with promises.
    await jest.advanceTimersByTimeAsync(5000)
    await expect(promise).resolves.toBe('done')
  })

  it('tests a debounce', () => {
    const calls: string[] = []
    let timer: ReturnType<typeof setTimeout> | undefined
    const debounced = (value: string) => {
      clearTimeout(timer)
      timer = setTimeout(() => calls.push(value), 300)
    }

    debounced('a')
    debounced('ab')
    debounced('abc')
    expect(calls).toEqual([]) // nothing yet

    jest.advanceTimersByTime(300)
    expect(calls).toEqual(['abc']) // only the last call survived
  })

  it('controls the date too', () => {
    jest.setSystemTime(new Date('2026-01-15T12:00:00Z'))
    expect(new Date().toISOString()).toBe('2026-01-15T12:00:00.000Z')
  })
})
