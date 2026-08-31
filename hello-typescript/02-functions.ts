// Functions — typed parameters, return types, optional/default params, arrow functions.
// Goal: learn how TypeScript checks a function's inputs and output.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 02

// Parameter and return types are annotated after a colon.
function add(a: number, b: number): number {
  return a + b
}

// `?` marks a parameter optional; it's `T | undefined` inside the function.
function greet(name: string, title?: string): string {
  return title ? `Hello, ${title} ${name}` : `Hello, ${name}`
}

// A default value also makes a parameter optional, and TypeScript infers its type.
function repeat(text: string, times = 2): string {
  return text.repeat(times)
}

// Rest parameters collect the remaining arguments into a typed array.
function sum(...values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

// Arrow function with the same annotation style. `void` means "no meaningful return value".
const logResult = (label: string, value: number): void => {
  console.log(`${label}: ${value}`)
}

logResult('add', add(2, 3))
console.log(greet('World'))
console.log(greet('World', 'Dr.'))
console.log(repeat('ha', 3))
logResult('sum', sum(1, 2, 3, 4))
