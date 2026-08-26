// State & Events — a controlled text input and a click counter with useState.
// Goal: learn how component state changes trigger re-renders.
//
// Run:  cd helloworld && npm run dev
//       (first set index.html's <script src> to "/03-state-and-events.tsx")
// Open: http://localhost:5173/

import { useState } from 'react'
import { createRoot } from 'react-dom/client'

interface GreetingProps {
  name: string
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}</h1>
}

function App() {
  const [name, setName] = useState('World')
  const [count, setCount] = useState(0)

  return (
    <div>
      <Greeting name={name} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Type a name"
      />
      <p>
        <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
      </p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
