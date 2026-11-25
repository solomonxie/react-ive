/**
 * @jest-environment node
 */
// Lesson 05 (part 2): the docblock above switches this one file to the node
// environment. Backend tests in a real project use node, not jsdom.
//
// Runs together with the other lesson 05 file: npm run lesson -- 05
test('there is no window in node env', () => {
  expect(typeof window).toBe('undefined')
})
