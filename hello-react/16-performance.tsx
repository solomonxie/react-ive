// Performance: React.memo, useMemo, useCallback, keys, useDeferredValue and useTransition.
// Patterns common in larger apps:
//   a memoized table body: MemoizedTableBody = memo(...)
//   export const X = memo(function X(...)) for heavy cards
//   useDeferredValue/useTransition in a searchable panel
//
// Ideas:
// - By default a parent re-render re-renders every child. Usually fine. Measure before fixing.
// - memo(Component) skips re-render when props are shallow-equal. It only helps if the
//   props really stay equal, so objects/functions passed down need useMemo/useCallback.
// - key must be a stable unique id (never the array index for lists that reorder or change).
//   A changing key remounts and throws away the component's state.
// - useDeferredValue: the input stays responsive, the heavy list catches up a moment later.
// - useTransition: mark a state update as non-urgent, with an isPending flag.
//
// Run:  npm run lesson -- 16
// Open: http://localhost:5173/

import { memo, useCallback, useDeferredValue, useMemo, useRef, useState, useTransition } from 'react'
import { createRoot } from 'react-dom/client'

interface Row {
  id: number
  label: string
}
const ROWS: Row[] = Array.from({ length: 3000 }, (_, index) => ({ id: index, label: `Row number ${index}` }))

function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

// Deliberately slow to render, so the effect of memo is visible.
const SlowRow = memo(function SlowRow({ row, onPick }: { row: Row; onPick: (id: number) => void }) {
  const start = performance.now()
  while (performance.now() - start < 0.05) { /* burn time */ }
  return <li onClick={() => onPick(row.id)}>{row.label}</li>
})

function MemoDemo() {
  const [tick, setTick] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const renders = useRenderCount()
  const rows = useMemo(() => ROWS.slice(0, 200), [])
  // Without useCallback, onPick is a new function each render and memo is defeated.
  const onPick = useCallback((id: number) => setPicked(id), [])

  return (
    <section>
      <h2>memo + useCallback</h2>
      <button onClick={() => setTick((t) => t + 1)}>Re-render parent ({tick})</button> parent renders: {renders}, picked: {String(picked)}
      <ul style={{ maxHeight: 100, overflow: 'auto' }}>
        {rows.map((row) => <SlowRow key={row.id} row={row} onPick={onPick} />)}
      </ul>
      <small>Remove useCallback above and the button gets visibly slower: all 200 rows re-render.</small>
    </section>
  )
}

function KeysDemo() {
  const [items, setItems] = useState(['a', 'b', 'c'])
  return (
    <section>
      <h2>keys</h2>
      <button onClick={() => setItems((previous) => [`n${previous.length}`, ...previous])}>Add to front</button>
      <p><small>Type in the inputs, then add to the front. Left list uses the index as key: your text sticks to the position and ends up on the wrong row. Right list uses a stable id.</small></p>
      <div style={{ display: 'flex', gap: 24 }}>
        <ul>{items.map((item, index) => <li key={index}>{item} <input size={6} /></li>)}</ul>
        <ul>{items.map((item) => <li key={item}>{item} <input size={6} /></li>)}</ul>
      </div>
    </section>
  )
}

function FilterDemo() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  // useMemo: only refilter when the deferred query changes, not on unrelated renders.
  const matches = useMemo(() => ROWS.filter((row) => row.label.includes(deferredQuery)), [deferredQuery])

  const [tab, setTab] = useState<'a' | 'b'>('a')
  const [isPending, startTransition] = useTransition()

  return (
    <section>
      <h2>useDeferredValue + useMemo</h2>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="filter 3000 rows" />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        {matches.length} matches
        <ul style={{ maxHeight: 100, overflow: 'auto' }}>
          {matches.slice(0, 300).map((row) => <SlowRow key={row.id} row={row} onPick={() => {}} />)}
        </ul>
      </div>

      <h2>useTransition</h2>
      <button onClick={() => startTransition(() => setTab(tab === 'a' ? 'b' : 'a'))}>Switch tab (now {tab})</button> {isPending && 'switching...'}
    </section>
  )
}

createRoot(document.getElementById('root')!).render(
  <>
    <h1>Performance</h1>
    <MemoDemo />
    <KeysDemo />
    <FilterDemo />
  </>,
)
