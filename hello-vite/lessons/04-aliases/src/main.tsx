// Lesson 04: this file has no relative imports at all.
//  '@features/greeting'  -> tsconfig.json paths, applied by resolve.tsconfigPaths
//  '@lib/shout' (used inside Greeting) -> resolve.alias in vite.config.ts
import { createRoot } from 'react-dom/client'
import { Greeting } from '@features/greeting'

createRoot(document.getElementById('root')!).render(<Greeting name="aliases" />)
