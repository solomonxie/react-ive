// Components & Props — splits the greeting into a reusable <Greeting name> component.
// Goal: learn how data flows into a component via typed props.
//
// Run:  cd helloworld && npm run dev
//       (first set index.html's <script src> to "/02-components-and-props.tsx")
// Open: http://localhost:5173/

import { createRoot } from 'react-dom/client'

interface GreetingProps {
  name: string
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}</h1>
}

function App() {
  return (
    <div>
      <Greeting name="World" />
      <Greeting name="TypeScript" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
