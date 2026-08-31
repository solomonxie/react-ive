// Generics — writing code that works over a type parameter instead of one fixed type.
// Goal: learn generic functions, generic interfaces, and constraining a type parameter.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 05

// `<T>` is a placeholder type filled in at the call site. Without generics
// this would have to be `any`, losing the connection between input and output.
function first<T>(items: T[]): T | undefined {
  return items[0]
}

// A generic interface: `Box<T>` wraps any type T.
interface Box<T> {
  value: T
}

function unwrap<T>(box: Box<T>): T {
  return box.value
}

// `extends` constrains T to types that have a `.length` property.
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

const firstNumber = first([1, 2, 3]) // inferred as number | undefined
const firstName = first(['Ada', 'Grace']) // inferred as string | undefined
const boxed: Box<string> = { value: 'hello' }

console.log(firstNumber, firstName, unwrap(boxed))
console.log(longest('short', 'much longer'))
console.log(longest([1, 2], [1, 2, 3]))
