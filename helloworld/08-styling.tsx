// Styling — CSS Modules applied to the greeting, nav, and error components.
// Goal: learn scoped component styling in a Vite + TS setup.
//
// Run:  cd helloworld && npm run dev
//       (first set index.html's <script src> to "/08-styling.tsx")
// Open: http://localhost:5173/

import { createContext, useContext, useEffect, useState, type ReactNode, type SubmitEvent } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate, useParams } from 'react-router-dom'
import styles from './08-styling.module.css'

interface GreetingProps {
  name: string
}

function Greeting({ name }: GreetingProps) {
  return <h1 className={styles.greeting}>Hello, {name}</h1>
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

  if (error) return <p className={styles.error}>Error: {error}</p>
  if (!user) return <p>Loading...</p>
  return <p>Fetched user: {user.name}</p>
}

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

// --- controlled form with typed state + validation ---

interface SignupForm {
  email: string
  password: string
}

function SignupPage() {
  const [form, setForm] = useState<SignupForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof SignupForm, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(field: keyof SignupForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email'
    if (form.password.length < 8) nextErrors.password = 'Min 8 characters'
    setErrors(nextErrors)
    setSubmitted(Object.keys(nextErrors).length === 0)
  }

  return (
    <div>
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && <p>{errors.email}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
          />
          {errors.password && <p>{errors.password}</p>}
        </div>
        <button type="submit">Sign up</button>
      </form>
      {submitted && <p>Signed up as {form.email}</p>}
    </div>
  )
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
    <nav className={styles.nav}>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/user/1">User 1 (protected)</Link>
      <Link to="/signup">Sign up</Link>
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
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
