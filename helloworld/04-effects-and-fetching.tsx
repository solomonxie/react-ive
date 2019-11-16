// Effects & Data Fetching — useEffect runs a fetch() on mount with typed
// loading/error/success state. Goal: learn side effects and async data in React.
//
// Run:  cd helloworld && npm run dev
//       (first set index.html's <script src> to "/04-effects-and-fetching.tsx")
// Open: http://localhost:5173/

import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

interface GreetingProps {
  name: string
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}</h1>
}

interface User {
  id: number
  name: string
}

function UserInfo() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json() as Promise<User>
      })
      .then(setUser)
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <p>Error: {error}</p>
  if (!user) return <p>Loading...</p>
  return <p>Fetched user: {user.name}</p>
}

function App() {
  const [name, setName] = useState('World')

  return (
    <div>
      <Greeting name={name} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type a name"
      />
      <UserInfo />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
