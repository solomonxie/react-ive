// Context & Route Guards — an Auth Context shared app-wide, plus a
// ProtectedRoute that redirects when logged out (React's closest analogue
// to server middleware). Goal: learn Context and gating routes on state.
//
// Run:  cd helloworld && npm run dev
//       (first set index.html's <script src> to "/06-context-and-guards.tsx")
// Open: http://localhost:5173/

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate, useParams } from 'react-router-dom'

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

// --- "middleware": shared auth state via Context, checked by a route guard ---

interface AuthContextValue {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const value: AuthContextValue = {
    isLoggedIn,
    login: () => setIsLoggedIn(true),
    logout: () => setIsLoggedIn(false),
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <>{children}</> : <Navigate to="/" replace />
}

function HomePage() {
  const [name, setName] = useState('World')
  const { isLoggedIn, login, logout } = useAuth()
  return (
    <div>
      <Greeting name={name} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type a name"
      />
      <p>
        Status: {isLoggedIn ? 'logged in' : 'logged out'}{' '}
        <button onClick={isLoggedIn ? logout : login}>
          {isLoggedIn ? 'Log out' : 'Log in'}
        </button>
      </p>
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
      <Link to="/user/1">User 1 (protected)</Link>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/user/:id"
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
