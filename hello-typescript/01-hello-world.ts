// Hello World — basic types and type inference.
// Goal: see how TypeScript attaches a type to a value, either inferred or annotated.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 01

// Inference: TypeScript figures out the type from the assigned value.
let greeting = 'Hello, World'

// Annotation: the type is spelled out explicitly. Useful when there's no
// initial value to infer from, or when you want a stricter type than inferred.
let age: number = 30
let isLearning: boolean = true
let tags: string[] = ['typescript', 'basics']

// Reassigning to a mismatched type is a compile-time error, not a runtime one:
// age = 'thirty' // Error: Type 'string' is not assignable to type 'number'.

console.log(`${greeting} — age ${age}, learning: ${isLearning}, tags: ${tags.join(', ')}`)
