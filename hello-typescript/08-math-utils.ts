// Helper module for lesson 08 — a plain module with typed exports.
// Not a lesson on its own; imported by 08-async-and-modules.ts.

export interface Stats {
  sum: number
  average: number
}

export function summarize(values: number[]): Stats {
  const sum = values.reduce((total, value) => total + value, 0)
  return { sum, average: sum / values.length }
}
