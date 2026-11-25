import { useState } from 'react'

export function Counter({ initial = 0 }: { initial?: number }) {
  const [count, setCount] = useState(initial)
  return (
    <section>
      <h2>Counter</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)} disabled={count === 0}>
        Reset
      </button>
    </section>
  )
}
