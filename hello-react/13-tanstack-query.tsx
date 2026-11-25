// Server cache with TanStack Query: useQuery, useMutation, query keys, invalidation.
// A pattern common in larger apps: useQuery with a structured queryKey, staleTime,
// placeholderData: keepPreviousData.
// Lesson 04 did fetching by hand with useEffect. The cache replaces that code and
// adds: dedupe, retries, refetching, shared data between components.
//
// Ideas:
// - queryKey identifies the data. Everything the queryFn depends on belongs in the key
//   (page, user, filters); change the key and the query refetches by itself.
// - staleTime: how long cached data counts as fresh (no refetch on remount).
// - keepPreviousData: show the old page while the next one loads (no flicker).
// - useMutation changes data; on success invalidate the keys that are now stale.
// - The fake API below is an in-memory array behind promises with a delay.
//
// Run:  npm run lesson -- 13
// Open: http://localhost:5173/

import { keepPreviousData, QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

interface Alert {
  id: number
  title: string
  done: boolean
}

// ---- fake API --------------------------------------------------------------
const db: Alert[] = Array.from({ length: 12 }, (_, index) => ({ id: index + 1, title: `Alert ${index + 1}`, done: false }))
const PAGE_SIZE = 4
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let fetchCount = 0

const api = {
  async listAlerts(page: number) {
    fetchCount += 1
    await wait(600)
    if (page === 2 && Math.random() < 0.5) throw new Error('Random failure on page 2 (try again)')
    return { items: db.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), total: db.length }
  },
  async markDone(id: number) {
    await wait(400)
    const alert = db.find((a) => a.id === id)
    if (!alert) throw new Error('Not found')
    alert.done = true
    return alert
  },
}

// ---- hooks (a common split: one hook per query) ---------------
const alertKeys = {
  all: ['alerts'] as const,
  page: (page: number) => ['alerts', 'page', page] as const,
}

function useAlerts(page: number) {
  return useQuery({
    queryKey: alertKeys.page(page),
    queryFn: () => api.listAlerts(page),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: false, // so the page-2 error shows immediately; the default is 3 retries
  })
}

function useMarkDone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.markDone,
    // Prefix match: invalidates every page under ['alerts'].
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertKeys.all }),
  })
}

function AlertList() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useAlerts(page)
  const markDone = useMarkDone()

  if (isPending) return <p>Loading...</p>
  if (isError) {
    return (
      <p>
        Error: {error.message} <button onClick={() => void refetch()}>Retry</button> <button onClick={() => setPage(0)}>Back</button>
      </p>
    )
  }

  const pageCount = Math.ceil(data.total / PAGE_SIZE)
  return (
    <div>
      <p>
        Page {page + 1} of {pageCount} {isFetching && <small>(fetching...)</small>} <small>API calls so far: {fetchCount}</small>
      </p>
      <ul style={{ opacity: isPlaceholderData ? 0.5 : 1 }}>
        {data.items.map((alert) => (
          <li key={alert.id}>
            {alert.title} {alert.done ? '(done)' : (
              <button disabled={markDone.isPending} onClick={() => markDone.mutate(alert.id)}>Mark done</button>
            )}
          </li>
        ))}
      </ul>
      <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
      <button disabled={page + 1 >= pageCount || isPlaceholderData} onClick={() => setPage((p) => p + 1)}>Next</button>
      <p><small>Go to the next page and back: the cached page shows instantly (staleTime 30s).</small></p>
    </div>
  )
}

// One client for the app, created outside components so it is not rebuilt on render.
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <h1>TanStack Query</h1>
    <AlertList />
  </QueryClientProvider>,
)
