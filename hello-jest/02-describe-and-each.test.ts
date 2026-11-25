// Lesson 02: grouping, setup/teardown, and tables.
//
// Run: npm run lesson -- 02
//
// In a real app: nearly every file wraps tests in describe("thing", ...) and
// uses beforeEach to reset shared state.

class Cart {
  items: { name: string; price: number }[] = []
  add(name: string, price: number) {
    this.items.push({ name, price })
  }
  total() {
    return this.items.reduce((sum, item) => sum + item.price, 0)
  }
}

// describe groups tests. Names read like a sentence: "Cart total sums prices".
describe('Cart', () => {
  let cart: Cart

  // beforeEach runs before every test in this describe, so each test starts
  // with a fresh cart. Tests must not depend on each other.
  beforeEach(() => {
    cart = new Cart()
  })

  // afterEach is for cleanup (close things, restore globals).
  afterEach(() => {
    cart.items = []
  })

  // beforeAll / afterAll run once for the whole describe. Use them for
  // expensive setup only; shared state between tests is a trap.
  beforeAll(() => {
    // e.g. start a test database
  })

  it('starts empty', () => {
    expect(cart.total()).toBe(0)
  })

  it('sums prices', () => {
    cart.add('pen', 2)
    cart.add('book', 10)
    expect(cart.total()).toBe(12)
  })

  // Nested describe blocks inherit the outer beforeEach.
  describe('with items', () => {
    beforeEach(() => {
      cart.add('pen', 2)
    })

    it('has one item', () => {
      expect(cart.items).toHaveLength(1)
    })
  })
})

// test.each runs the same test over a table of cases. Each row becomes its
// own test with its own pass/fail. Great for validators and formatters.
function isEven(n: number) {
  return n % 2 === 0
}

describe('isEven', () => {
  // %i and %s fill in the title from the row's values
  test.each([
    [0, true],
    [1, false],
    [2, true],
    [-3, false],
  ])('isEven(%i) is %s', (input, expected) => {
    expect(isEven(input)).toBe(expected)
  })

  // Object rows with a named title: $name reads a field.
  test.each([
    { name: 'zero', input: 0, expected: true },
    { name: 'odd', input: 7, expected: false },
  ])('$name', ({ input, expected }) => {
    expect(isEven(input)).toBe(expected)
  })
})

// test.skip and test.todo keep a note without running or failing.
test.todo('handles very large numbers')

// test.only runs ONLY that test in the file. Useful while debugging, but never
// commit it. A lint config can flag it (oxlint jest/no-focused-tests).
