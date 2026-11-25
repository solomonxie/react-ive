// Shared client state with jotai atoms, and choosing between context, atoms and a server cache.
// Patterns common in larger apps: a page-title atom (atom + useAtom/useSetAtom, a hook
//   wrapping the atom), a user atom (atom<User | null>(null) set once at the app root),
//   and a jotai Provider scoping atoms to a subtree.
//
// Ideas:
// - atom(initial) is a piece of state that lives outside any component. No provider needed
//   for the default store.
// - useAtom -> [value, set]; useAtomValue -> read only; useSetAtom -> write only. The write-only
//   hook does NOT re-render when the value changes: use it in components that only set.
// - A derived atom (atom((get) => ...)) recomputes from other atoms.
// - <Provider> creates a separate store, so the same atoms hold different values per subtree.
//
// Which tool?
// - Server data (lists, details from the API): TanStack Query / Apollo. It owns caching and freshness.
// - Local state shared by a few related components, with logic: context + custom hook (lesson 10).
// - Small global values read by far-apart components (page title, current user, toggles): atoms.
//
// Run:  npm run lesson -- 15
// Open: http://localhost:5173/

import { atom, Provider, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

const pageTitleAtom = atom('Home')
const counterAtom = atom(0)
// Derived (read-only) atom.
const doubledAtom = atom((get) => get(counterAtom) * 2)

// Like a typical useSetPageTitle hook: pages call it, the header displays it.
function useSetPageTitle(title: string) {
  const setTitle = useSetAtom(pageTitleAtom)
  useEffect(() => {
    setTitle(title)
  }, [setTitle, title])
}

function Header() {
  const title = useAtomValue(pageTitleAtom)
  useEffect(() => {
    document.title = `${title} | lesson 15`
  }, [title])
  return <h2>Header shows: {title}</h2>
}

function SettingsPage() {
  useSetPageTitle('Settings')
  return <p>Settings page set the title via an atom.</p>
}

function HomePage() {
  useSetPageTitle('Home')
  return <p>Home page.</p>
}

function Renders({ name }: { name: string }) {
  const renders = useRef(0)
  renders.current += 1
  return <small> {name} rendered {renders.current}x</small>
}

function IncrementButton() {
  // Write-only: this component does not re-render when the counter changes.
  const setCount = useSetAtom(counterAtom)
  return (
    <>
      <button onClick={() => setCount((count) => count + 1)}>Increment</button>
      <Renders name="button" />
    </>
  )
}

function CounterView({ label }: { label: string }) {
  const [count] = useAtom(counterAtom)
  const doubled = useAtomValue(doubledAtom)
  return <p>{label}: count {count}, doubled {doubled}</p>
}

function Pages() {
  const [page, setPage] = useState<'home' | 'settings'>('home')
  return (
    <>
      <button onClick={() => setPage('home')}>Go home</button>
      <button onClick={() => setPage('settings')}>Go to settings</button>
      {page === 'home' ? <HomePage /> : <SettingsPage />}
    </>
  )
}

function App() {
  return (
    <>
      <h1>jotai atoms</h1>
      <Header />
      <Pages />

      <h2>Same atoms, shared store</h2>
      <IncrementButton />
      <CounterView label="Shared A" />
      <CounterView label="Shared B" />

      <h2>Inside a Provider: its own store</h2>
      <Provider>
        <IncrementButton />
        <CounterView label="Scoped" />
      </Provider>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
