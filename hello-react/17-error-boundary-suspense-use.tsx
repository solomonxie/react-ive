// Error boundary + Suspense + React 19's `use`.
// Common in larger apps: the root wraps the app in an <ErrorBoundary> (sometimes an
//   auth-specific one too), and uses <Suspense> around lazy parts.
//
// Ideas:
// - An error boundary catches errors thrown while RENDERING its children and shows a fallback
//   instead of a blank page. It must be a class component (React still has no hook for this).
//   It does not catch errors in event handlers or in async code.
// - <Suspense fallback> shows a fallback while a child is "waiting" (lazy component, or a
//   promise read with `use`).
// - use(promise) reads a promise during render: pending -> nearest Suspense, rejected ->
//   nearest error boundary. The promise must be created OUTSIDE render (or cached), otherwise
//   every render makes a new one and it never settles.
//
// Run:  npm run lesson -- 17
// Open: http://localhost:5173/

import { Component, Suspense, use, useState, type ErrorInfo, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

interface BoundaryProps {
  fallback: (error: Error, reset: () => void) => ReactNode
  children: ReactNode
}

class ErrorBoundary extends Component<BoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Caught by boundary', error, info.componentStack) // real apps often report to analytics here
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset)
    return this.props.children
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function fetchGreeting(shouldFail: boolean) {
  return wait(800).then(() => {
    if (shouldFail) throw new Error('The greeting request failed')
    return 'Hello from a promise'
  })
}

function Greeting({ promise }: { promise: Promise<string> }) {
  const text = use(promise) // suspends until resolved; throws if rejected
  return <p>{text}</p>
}

function Loader({ shouldFail }: { shouldFail: boolean }) {
  // Created once per mount of Loader (the lazy initial state), not on every render.
  const [promise] = useState(() => fetchGreeting(shouldFail))
  return (
    <Suspense fallback={<p>Loading greeting...</p>}>
      <Greeting promise={promise} />
    </Suspense>
  )
}

function App() {
  const [shouldFail, setShouldFail] = useState(false)
  const [run, setRun] = useState(0)

  return (
    <>
      <h1>Error boundary + Suspense + use</h1>
      <label>
        <input type="checkbox" checked={shouldFail} onChange={(event) => setShouldFail(event.target.checked)} /> make the request fail
      </label>{' '}
      <button onClick={() => setRun((n) => n + 1)}>Load again</button>
      <ErrorBoundary
        key={run}
        fallback={(error, reset) => (
          <p style={{ color: 'crimson' }}>
            Something went wrong: {error.message} <button onClick={reset}>Dismiss</button>
          </p>
        )}
      >
        <Loader shouldFail={shouldFail} />
      </ErrorBoundary>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
