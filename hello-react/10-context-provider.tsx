// Context + provider + a custom hook that throws outside the provider.
// A pattern you'll see in most larger React apps: createContext<... | null>(null),
// a Provider component, and a useExportFormContext() hook that throws if there is no provider.
//
// Why the throw: with a `null` default, TypeScript forces every consumer to
// handle null. Wrapping useContext in a hook that throws narrows the type to
// "definitely there", and a forgotten provider fails loudly in development
// instead of producing a confusing undefined later.
//
// Lesson 06 showed a basic context. This one adds a pattern common in larger apps.
//
// Run:  npm run lesson -- 10
// Open: http://localhost:5173/

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

interface CartContextValue {
  items: string[]
  add: (item: string) => void
  clear: () => void
}

// null = "no provider above me".
const CartContext = createContext<CartContextValue | null>(null)

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([])

  // The value object is a new object each render unless memoized. Every
  // consumer re-renders when the value changes identity, so memoize when the
  // provider re-renders for reasons unrelated to the cart.
  // (A form context is a case where you may deliberately NOT memoize: consumers
  // need to re-render because the form's formState changes in place.)
  const value = useMemo<CartContextValue>(
    () => ({
      items,
      add: (item) => setItems((previous) => [...previous, item]),
      clear: () => setItems([]),
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

function AddButtons() {
  const { add } = useCart()
  return (
    <>
      <button onClick={() => add('apple')}>Add apple</button>
      <button onClick={() => add('pear')}>Add pear</button>
    </>
  )
}

function CartSummary() {
  const { items, clear } = useCart()
  return (
    <div>
      <p>{items.length} item(s): {items.join(', ') || 'empty'}</p>
      <button onClick={clear}>Clear</button>
    </div>
  )
}

// Uncomment this component in <App> to see the error thrown for a missing provider.
function OutsideProvider() {
  useCart()
  return null
}
void OutsideProvider

function App() {
  return (
    <CartProvider>
      <h1>Context + provider + throwing hook</h1>
      <AddButtons />
      <CartSummary />
      {/* <OutsideProvider /> */}
    </CartProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
