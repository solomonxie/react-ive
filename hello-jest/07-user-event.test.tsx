// Lesson 07: user-event, testing behavior not implementation.
//
// Run: npm run lesson -- 07
//
// user-event v14 simulates what a person does: focus, type, click, with the
// real event sequence. Prefer it over fireEvent, which fires one raw event.
//
// Behavior vs implementation: a good test only knows what the user sees and
// what the component hands to the outside (props callbacks). It does NOT read
// useState values or call internal functions. If you can refactor the
// component without touching the test, the test is behavior-focused.
//
// In a real app: @testing-library/user-event 14.

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { Counter } from '@src/components/Counter'
import { SignupForm } from '@src/components/SignupForm'

test('clicking increments the counter', async () => {
  // v14: create a user first, then await every interaction.
  const user = userEvent.setup()
  render(<Counter />)

  await user.click(screen.getByRole('button', { name: 'Increment' }))
  await user.click(screen.getByRole('button', { name: 'Increment' }))

  expect(screen.getByText('Count: 2')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Reset' }))
  expect(screen.getByText('Count: 0')).toBeInTheDocument()
})

describe('SignupForm', () => {
  it('submits what the user typed', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<SignupForm onSubmit={onSubmit} />)

    // getByLabelText finds the input through its <label>.
    await user.type(screen.getByLabelText('Name'), 'Ada')
    await user.type(screen.getByLabelText('Email'), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com' })
  })

  it('shows an error and does not submit for a bad email', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears the error once the email is fixed', async () => {
    const user = userEvent.setup()
    render(<SignupForm onSubmit={jest.fn()} />)

    await user.type(screen.getByLabelText('Email'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))
    await user.type(screen.getByLabelText('Email'), '@x.com')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

// Other helpers worth knowing: user.clear, user.selectOptions, user.keyboard('{Enter}'),
// user.tab(), user.hover(), user.upload.
