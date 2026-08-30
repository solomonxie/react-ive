// Routing — react-router-dom with static routes and a dynamic /user/:id route.
// Goal: learn client-side navigation and reading URL params.
//
// Run:  cd helloworld && npm run dev
//       npm run lesson -- 05
// Open: http://localhost:5173/

import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom'

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

function UserInfo({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setUser(null)
    setError(null)
    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json() as Promise<User>
      })
      .then(setUser)
      .catch((err: Error) => setError(err.message))
  }, [userId])

  if (error) return <p>Error: {error}</p>
  if (!user) return <p>Loading...</p>
  return <p>Fetched user: {user.name}</p>
}

function HomePage() {
  const [name, setName] = useState('World')
  return (
    <div>
      <Greeting name={name} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type a name"
      />
    </div>
  )
}

function AboutPage() {
  return <p>A progressive TypeScript + React learning app.</p>
}

function UserPage() {
  const { id } = useParams<{ id: string }>()
  return <UserInfo userId={id ?? '1'} />
}

function Nav() {
  return (
    <nav>
      <Link to="/">Home</Link> | <Link to="/about">About</Link> |{' '}
      <Link to="/user/1">User 1</Link>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/user/:id" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
