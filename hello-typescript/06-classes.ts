// Classes — access modifiers, readonly fields, inheritance, and interfaces.
// Goal: learn how TypeScript adds compile-time checks on top of JS classes.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 06

interface Greetable {
  greet(): string
}

class Person implements Greetable {
  // `public` fields declared in the constructor's parameter list are both
  // declared and assigned in one step — no separate `this.name = name` needed.
  constructor(
    public name: string,
    private age: number,
    readonly id: number,
  ) {}

  greet(): string {
    return `Hi, I'm ${this.name}`
  }

  // `private` fields aren't accessible outside the class...
  isAdult(): boolean {
    return this.age >= 18 // ...but methods on the class itself can read them.
  }
}

// `extends` inherits fields and methods; `super(...)` calls the parent constructor.
class Employee extends Person {
  constructor(
    name: string,
    age: number,
    id: number,
    public role: string,
  ) {
    super(name, age, id)
  }

  override greet(): string {
    return `${super.greet()}, working as ${this.role}`
  }
}

const person = new Person('Ada', 30, 1)
const employee = new Employee('Grace', 40, 2, 'Engineer')

// person.age // Error: Property 'age' is private and only accessible within class 'Person'.

console.log(person.greet(), person.isAdult())
console.log(employee.greet())
