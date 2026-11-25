// Custom hooks: pull stateful logic out of components into reusable functions.
// Patterns you'll see in most larger React apps: useDisclosure, useCopyToClipboard,
// useIntersectionObserver, useDarkMode.
//
// Rules of hooks (the linter enforces them): call hooks only at the top level
// of a component or another hook, never inside if/for/callbacks, and name your
// own hooks `useSomething` so the linter knows to check them.
//
// Run:  npm run lesson -- 09
// Open: http://localhost:5173/

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

// 1. useDisclosure: a boolean plus named actions. A common return shape in real apps.
function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial)
  // Functional updates mean these functions never go stale, so they can be
  // created once with useCallback and passed to memoized children safely.
  const actions = useMemo(
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((previous) => !previous),
    }),
    [],
  )
  return [open, actions] as const
}

// 2. useCopyToClipboard: state + an effect that resets it after 2 seconds.
// The effect returns a cleanup so a pending timer never fires after unmount
// or after a second copy.
function useCopyToClipboard({ onCopyFailed }: { onCopyFailed?: () => void } = {}) {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeout = setTimeout(() => setIsCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [isCopied])

  // useCallback keeps `copy` the same function between renders, as long as
  // onCopyFailed is the same. Without it, anything with `copy` in a
  // dependency array would re-run on every render.
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setIsCopied(true)
      } catch {
        onCopyFailed?.()
      }
    },
    [onCopyFailed],
  )
  return { isCopied, copy }
}

// 3. useIntersectionObserver: a "callback ref" stored in state, so the effect
// re-runs when the element actually appears (a plain useRef would not
// trigger anything when it changes).
function useIntersectionObserver() {
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [isThresholdCrossed, setIsThresholdCrossed] = useState(false)

  useEffect(() => {
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setIsThresholdCrossed(!entry.isIntersecting)
      },
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return [setElement, isThresholdCrossed] as const
}

// 4. useLocalStorage + useDarkMode: hooks can build on other hooks.
function useLocalStorage<T extends string>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => (localStorage.getItem(key) as T | null) ?? fallback)
  const set = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved = typeof next === 'function' ? next(previous) : next
        localStorage.setItem(key, resolved)
        return resolved
      })
    },
    [key],
  )
  return [value, set] as const
}

type Theme = 'light' | 'dark'

function useDarkMode() {
  const [theme, setTheme] = useLocalStorage<Theme>('lesson-09-theme', 'light')
  // The functional update matters: a toggle that is registered once in
  // a command palette and would flip only one way if it read a stale `theme`.
  const toggle = useCallback(() => setTheme((previous) => (previous === 'dark' ? 'light' : 'dark')), [setTheme])
  return { isDarkMode: theme === 'dark', toggle }
}

// 5. useRef for a value that must survive renders without causing one.
function RenderCounter() {
  const renders = useRef(0)
  renders.current += 1
  return <small> (rendered {renders.current} times)</small>
}

function Demo() {
  const [isOpen, { toggle }] = useDisclosure()
  const { isCopied, copy } = useCopyToClipboard({ onCopyFailed: () => alert('Clipboard blocked') })
  const [sentinelRef, scrolledPast] = useIntersectionObserver()
  const { isDarkMode, toggle: toggleTheme } = useDarkMode()

  return (
    <div
      style={{
        padding: 16,
        background: isDarkMode ? '#222' : '#fff',
        color: isDarkMode ? '#eee' : '#111',
        minHeight: '150vh',
      }}
    >
      <div
        style={{ position: 'sticky', top: 0, background: scrolledPast ? 'gold' : 'transparent', color: '#000' }}
      >
        Sticky bar: {scrolledPast ? 'sentinel scrolled out of view' : 'sentinel visible'}
      </div>
      <h1>Custom hooks</h1>
      <div ref={sentinelRef}>Sentinel (scroll down until half of me is hidden)</div>

      <h2>useDisclosure</h2>
      <button onClick={toggle}>{isOpen ? 'Hide' : 'Show'} details</button>
      {isOpen && <p>Details are visible.</p>}

      <h2>useCopyToClipboard</h2>
      <button onClick={() => void copy('hello from lesson 09')}>{isCopied ? 'Copied' : 'Copy text'}</button>

      <h2>useDarkMode (kept in localStorage)</h2>
      <button onClick={toggleTheme}>Switch to {isDarkMode ? 'light' : 'dark'}</button>
      <RenderCounter />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Demo />)
