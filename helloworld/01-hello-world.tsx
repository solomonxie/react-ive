// Hello World — renders a single component to the DOM with createRoot.
// Goal: see the smallest possible React + JSX render pipeline.
//
// Run:  cd helloworld && npm run dev
// Open: http://localhost:5173/

import { createRoot } from 'react-dom/client'

function App() {
  return <h1>Hello, World</h1>
}

createRoot(document.getElementById('root')!).render(<App />)
