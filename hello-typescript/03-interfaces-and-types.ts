// Interfaces & Type Aliases — naming object shapes.
// Goal: learn two ways to describe the shape of an object, and readonly/optional fields.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 03

// An interface describes the shape of an object. `?` marks a field optional,
// `readonly` prevents reassignment after the object is created.
interface User {
  readonly id: number
  name: string
  email?: string
}

// A type alias can describe the same shape, plus things interfaces can't
// (unions, tuples, primitives). Interfaces are more common for object shapes
// because they can be extended and merged; type aliases are more flexible.
type Point = {
  x: number
  y: number
}

// Interfaces can extend other interfaces.
interface Admin extends User {
  permissions: string[]
}

const user: User = { id: 1, name: 'Ada' }
const origin: Point = { x: 0, y: 0 }
const admin: Admin = { id: 2, name: 'Grace', permissions: ['read', 'write'] }

// user.id = 99 // Error: Cannot assign to 'id' because it is a read-only property.

console.log(user, origin, admin)
