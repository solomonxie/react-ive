/**
 * Compare with a shared base config in a large app.
 * Same ideas, much smaller. See lesson 05 for a walk-through.
 * @type {import('jest').Config}
 */
module.exports = {
  rootDir: __dirname,
  // A typical unit config defaults to jsdom too. A file can opt out with
  // a `@jest-environment node` docblock at the top.
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/[0-9][0-9]-*.test.{ts,tsx}'],
  // In a real app: clearMocks: true. Resets mock.calls between tests.
  clearMocks: true,
  transform: {
    // In a real app: the same @swc/jest entry, transpile only (no type check)
    '^.+\\.[jt]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
          target: 'es2022',
        },
        module: { type: 'commonjs' },
      },
    ],
  },
  // In a real app: often generated from tsconfig "paths" (like @features/*, @components/*)
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  // In a real app: a shared test setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}
