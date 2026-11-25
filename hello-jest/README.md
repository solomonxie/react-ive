# Jest + React Testing Library: a progressive learning path

A small TypeScript project for learning how tests in a large React app
usually work. Each numbered `NN-*.test.ts(x)` file is a complete, runnable
lesson that adds one idea, with comments explaining it and notes on where a real
app does the same thing.

The setup mirrors a typical large app: Jest 30, `@swc/jest` to transform TypeScript,
jsdom as the default environment, `@testing-library/react` 16,
`@testing-library/user-event` 14 and `@testing-library/jest-dom`.

## Setup

```sh
cd hello-jest
npm install   # or: make install
```

## How to run

```sh
npm run lesson -- 01        # run one lesson (also: make lesson N=01)
npm test                    # run every lesson
npm test -- -t "toEqual"    # only tests whose name matches
npm run typecheck           # tsc (Jest itself never type-checks, see lesson 05)
npm run lint                # oxlint
```

Reading order matters: open the lesson file, read the comments, run it, then
break something (change an expected value) and watch how Jest reports it.

## Lessons

- `01-first-test.test.ts`: `test` and `expect`, the common matchers (`toBe`,
  `toEqual`, `toMatchObject`, `toThrow`), running a single file.
- `02-describe-and-each.test.ts`: `describe`, `beforeEach`/`afterEach`,
  nesting, `test.each` tables, `test.todo`.
- `03-async-and-timers.test.ts`: async tests, `resolves`/`rejects`, fake
  timers (`jest.useFakeTimers`, `advanceTimersByTime`), faking the date.
- `04-mocks.test.ts`: `jest.fn`, `jest.spyOn`, `jest.mock` of a module, and
  when not to mock.
- `05-config-and-environments.test.ts` and `05-config-node-env.test.ts`: what
  `jest.config.cjs` does (`@swc/jest` transform, `moduleNameMapper` for path
  aliases, setup file, jsdom vs node). Both files run for lesson 05.
- `06-rtl-render-and-query.test.tsx`: render a component, query by role and
  text, `getBy`/`queryBy`/`findBy`, jest-dom matchers.
- `07-user-event.test.tsx`: typing and clicking a small form, behavior over
  implementation.
- `08-hooks-and-fetching.test.tsx`: `renderHook` and `act`, a component that
  fetches (mocked `fetch`, `findBy*`, `waitFor`).
- `09-zod-and-forms.test.tsx`: test a zod schema on its own, then a
  react-hook-form form built on it (messages appear, submit is blocked).

## Files that support the lessons

- `jest.config.cjs`: the config, with comments pointing at what a shared
  base config and a per-app unit config usually hold.
- `jest.setup.ts`: registers jest-dom matchers.
- `src/`: the small modules and components the lessons test.
- `scripts/run-lesson.mjs`: runs only the files of one lesson.

## Where to look in a real app

- A shared base config: `@swc/jest`, path alias mapping.
- A per-app unit config: jsdom, css/svg stubs, setup files.
- Hook tests: `renderHook` plus `jest.mock`.
- Form tests: schema tests and form tests like lesson 09.
