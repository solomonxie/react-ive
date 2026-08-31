// Async & Modules — typed Promises, async/await, and import/export across files.
// Goal: learn how types flow through asynchronous code and across module boundaries.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 08

// `summarize` and `Stats` are typed exports from another module.
import { summarize, type Stats } from './08-math-utils'

// A function's declared return type wraps in Promise<T> once it's `async`.
async function fetchNumbers(): Promise<number[]> {
  // Simulates an API call with a resolved Promise.
  return Promise.resolve([4, 8, 15, 16, 23, 42])
}

async function loadStats(): Promise<Stats> {
  const numbers = await fetchNumbers()
  return summarize(numbers)
}

// Errors from a rejected Promise are caught like any thrown exception.
async function loadStatsSafely(): Promise<Stats | undefined> {
  try {
    return await loadStats()
  } catch (error) {
    console.error('Failed to load stats:', error)
    return undefined
  }
}

const stats = await loadStatsSafely()
console.log(stats)
