// Lesson 08: custom hooks and components that fetch.
//
// Run: npm run lesson -- 08
//
// In a real app: renderHook + act are used to test custom hooks.

import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { UserList } from '@src/components/UserList'
import { useToggle } from '@src/hooks/useToggle'

// ---------------------------------------------------------------------------
// renderHook: hooks can only run inside a component, so RTL makes a tiny
// throwaway one. result.current always holds the latest return value.
// ---------------------------------------------------------------------------
describe('useToggle', () => {
  it('starts with the initial value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.on).toBe(true)
  })

  it('flips when toggled', () => {
    const { result } = renderHook(() => useToggle())

    // act() wraps anything that updates state, so React finishes rendering
    // before you look at result.current.
    act(() => {
      result.current.toggle()
    })
    expect(result.current.on).toBe(true)

    act(() => {
      result.current.toggle()
    })
    expect(result.current.on).toBe(false)
  })

  it('re-runs with new props via rerender', () => {
    const { result, rerender } = renderHook(({ start }) => useToggle(start), {
      initialProps: { start: false },
    })
    expect(result.current.on).toBe(false)
    rerender({ start: true }) // useState ignores a new initial, so still false
    expect(result.current.on).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// A component that fetches. We mock the network edge (global fetch), not the
// component's internals. jsdom has no fetch, so we install our own.
// ---------------------------------------------------------------------------
describe('UserList', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  function mockFetchOnce(response: { ok: boolean; body?: unknown }) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: response.ok,
      json: async () => response.body,
    })
  }

  it('shows loading, then the users', async () => {
    mockFetchOnce({ ok: true, body: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }] })
    render(<UserList />)

    // Right after render the effect has not resolved yet.
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // findBy* = getBy* + waiting (up to 1s by default). The usual choice for
    // "wait until this shows up".
    expect(await screen.findByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Grace')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('/api/users')
  })

  it('shows an error when the request fails', async () => {
    mockFetchOnce({ ok: false })
    render(<UserList />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Request failed')
  })

  // waitFor retries a callback until it stops throwing. Use it when you are
  // waiting on something that is not "an element appears", such as a mock call.
  // Keep the callback to assertions only, with no side effects.
  it('waitFor retries until the assertion passes', async () => {
    mockFetchOnce({ ok: true, body: [] })
    render(<UserList />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    expect(screen.getByRole('list')).toBeEmptyDOMElement()
  })
})
