// Lesson 03: React through a plugin.
// Try it: click the button a few times, then change "Hello" below and save.
// The text updates and the count stays. That is Fast Refresh, added by the plugin.
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
// `?react` is handled by vite-plugin-svgr: the svg arrives as a component, and
// `currentColor` in the file means CSS `color` can paint it.
import Logo from './logo.svg?react'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div style={{ color: 'rebeccapurple', fontFamily: 'system-ui' }}>
      <Logo width={48} />
      <h1>Hello from React + SWC</h1>
      <button onClick={() => setCount(count + 1)}>count is {count}</button>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
