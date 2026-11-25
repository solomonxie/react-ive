// Lesson 09: a zod schema and a react-hook-form form built on it.
//
// Run: npm run lesson -- 09
//
// A typical export form works this way: a zod schema is the single
// source of truth for validation, and react-hook-form shows its messages.
// So test in two layers:
//   1. The schema alone: fast, no DOM, many cases (test.each). This is the
//      style of report-data-schema.test.ts.
//   2. The form once or twice: errors show up, submit is blocked, a valid
//      form submits. Do not re-test every schema rule through the UI.

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { ExportForm } from '@src/components/ExportForm'
import { exportSchema } from '@src/export-schema'

// ---------------------------------------------------------------------------
// Layer 1: the schema
// ---------------------------------------------------------------------------
const valid = {
  name: 'Q1 orders',
  email: 'ada@example.com',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
}

describe('exportSchema', () => {
  it('accepts a valid value', () => {
    expect(exportSchema.safeParse(valid).success).toBe(true)
  })

  // safeParse never throws; it returns { success, data | error }.
  // Assert on the message and the path so the test says which field fails.
  test.each([
    { why: 'empty name', patch: { name: '  ' }, path: 'name', message: 'Name is required' },
    { why: 'bad email', patch: { email: 'nope' }, path: 'email', message: 'Enter a valid email' },
    {
      why: 'end before start',
      patch: { endDate: '2025-12-31' },
      path: 'endDate',
      message: 'End date must be on or after the start date',
    },
  ])('rejects $why', ({ patch, path, message }) => {
    const result = exportSchema.safeParse({ ...valid, ...patch })

    expect(result.success).toBe(false)
    if (result.success) return // narrows the type for TypeScript
    expect(result.error.issues).toContainEqual(
      expect.objectContaining({ path: [path], message }),
    )
  })

  it('trims the name', () => {
    const result = exportSchema.parse({ ...valid, name: '  Q1  ' })
    expect(result.name).toBe('Q1')
  })
})

// ---------------------------------------------------------------------------
// Layer 2: the form
// ---------------------------------------------------------------------------
describe('ExportForm', () => {
  it('shows validation messages and blocks submit when empty', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ExportForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Export' }))

    // react-hook-form validates asynchronously, so use findBy*.
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Start date is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits parsed values when valid', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ExportForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Name'), 'Q1 orders')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    // user.type on date inputs needs the ISO format.
    await user.type(screen.getByLabelText('Start date'), '2026-01-01')
    await user.type(screen.getByLabelText('End date'), '2026-03-31')
    await user.click(screen.getByRole('button', { name: 'Export' }))

    // react-hook-form passes (values, event); we only care about the values.
    await screen.findByRole('button', { name: 'Export' })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0]?.[0]).toEqual(valid)
  })

  it('shows the cross-field error on the end date', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ExportForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Name'), 'Q1 orders')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.type(screen.getByLabelText('Start date'), '2026-03-31')
    await user.type(screen.getByLabelText('End date'), '2026-01-01')
    await user.click(screen.getByRole('button', { name: 'Export' }))

    expect(
      await screen.findByText('End date must be on or after the start date'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
