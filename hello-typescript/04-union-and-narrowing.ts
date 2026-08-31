// Union Types & Narrowing — values that can be one of several types.
// Goal: learn union types, literal types, and how TypeScript narrows them.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 04

// A union type means "one of these types".
type Id = string | number

function formatId(id: Id): string {
  // `typeof` narrows the union inside each branch.
  if (typeof id === 'string') {
    return id.toUpperCase()
  }
  return `#${id.toFixed(0)}`
}

// A literal type restricts a value to specific, exact values.
type Status = 'idle' | 'loading' | 'done'

function describe(status: Status): string {
  switch (status) {
    case 'idle':
      return 'Not started'
    case 'loading':
      return 'In progress'
    case 'done':
      return 'Finished'
  }
}

// A discriminated union: each shape shares a literal "kind" field TypeScript
// can switch on to narrow which fields are available.
type Shape = { kind: 'circle'; radius: number } | { kind: 'rectangle'; width: number; height: number }

function area(shape: Shape): number {
  if (shape.kind === 'circle') {
    return Math.PI * shape.radius ** 2
  }
  return shape.width * shape.height
}

console.log(formatId('abc'), formatId(42))
console.log(describe('loading'))
console.log(area({ kind: 'circle', radius: 2 }).toFixed(2))
console.log(area({ kind: 'rectangle', width: 3, height: 4 }))
