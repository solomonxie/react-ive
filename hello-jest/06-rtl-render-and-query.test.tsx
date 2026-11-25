// Lesson 06: React Testing Library (RTL): render and query.
//
// Run: npm run lesson -- 06
//
// RTL renders a component into jsdom and gives you ways to find things the way
// a USER would: by role, label and visible text, not by class names or state.
// The component under test is src/components/Counter.tsx.
//
// In a real app: @testing-library/react 16 + @testing-library/jest-dom.

import { render, screen } from '@testing-library/react'
import { Counter } from '@src/components/Counter'

test('renders the initial count', () => {
  render(<Counter initial={5} />)

  // screen is the whole document. getBy* throws if nothing is found, which
  // makes the test fail with a helpful DOM dump.
  expect(screen.getByText('Count: 5')).toBeInTheDocument()
})

// Query priority (best first), straight from the RTL docs:
//   getByRole  >  getByLabelText  >  getByPlaceholderText  >  getByText  >  getByTestId
// Role is best because it also checks accessibility: a "button" really is one.
test('finds elements by role', () => {
  render(<Counter />)

  expect(screen.getByRole('heading', { name: 'Counter' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Increment' })).toBeEnabled()
  // Reset is disabled while the count is 0. jest-dom matchers read well.
  expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
})

// The three query families:
//   getBy*    must exist now (throws otherwise)
//   queryBy*  returns null if missing. Use it to assert something is ABSENT.
//   findBy*   async, waits for it to appear (lesson 08)
// Each also has an *AllBy* version for many matches.
test('queryBy asserts absence', () => {
  render(<Counter />)

  expect(screen.queryByText('Count: 99')).not.toBeInTheDocument()
  // getByText('Count: 99') here would throw instead of returning null.
})

test('getAllByRole returns every match', () => {
  render(<Counter />)
  expect(screen.getAllByRole('button')).toHaveLength(2)
})

// Cleanup: RTL unmounts after each test automatically, so tests do not leak
// DOM into each other.

// Handy while debugging: screen.debug() prints the DOM, and
// screen.logTestingPlaygroundURL() suggests the best query for an element.
