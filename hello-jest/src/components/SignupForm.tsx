import { useState } from 'react'

export function SignupForm({ onSubmit }: { onSubmit: (data: { name: string; email: string }) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!email.includes('@')) {
          setError('Enter a valid email')
          return
        }
        setError('')
        onSubmit({ name, email })
      }}
    >
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">Sign up</button>
    </form>
  )
}
