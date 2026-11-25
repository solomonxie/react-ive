# TypeScript + React: a progressive learning path

A single Vite + TypeScript + React project. Each numbered file is a complete,
self-contained lesson — it contains everything the previous step taught, plus
one new concept, and mounts itself.

## Setup

```sh
cd hello-react
npm install
npm run dev
```

## How to run a lesson

The app has one stable entry point. Pass the lesson number to the runner:

```sh
npm run lesson -- 01
npm run lesson -- 02
npm run lesson -- 08
npm run lesson -- 12
```

The command starts Vite and opens the selected lesson. If you omit the number,
lesson 01 is used. You can also run `npm run dev` to start lesson 01.

## Lessons

- `01-hello-world.tsx`: JSX + rendering. Smallest possible component, mounted with `createRoot`.
- `02-components-and-props.tsx`: Components & props. A reusable `<Greeting name>` with typed props.
- `03-state-and-events.tsx`: State & events. `useState` for a controlled input and a click counter.
- `04-effects-and-fetching.tsx`: Effects & data fetching. `useEffect` + `fetch` with typed response, loading/error states.
- `05-routing.tsx`: Routing. `react-router-dom` with static and dynamic (`/user/:id`) routes.
- `06-context-and-guards.tsx`: Context & route guards ("middleware"). Auth `Context` + a `ProtectedRoute` wrapper that redirects.
- `07-forms.tsx`: Forms. Controlled inputs, typed form state, validation on submit.
- `08-styling.tsx`: Styling. CSS Modules (`08-styling.module.css`) applied to existing components.

Lessons 09-17 cover techniques common in larger production React apps.

- `09-custom-hooks.tsx`: Custom hooks, rules of hooks, `useCallback`/`useMemo`/`useRef`.
- `10-context-provider.tsx`: Context + provider + a hook that throws outside the provider.
- `11-react-hook-form-zod.tsx`: `useForm` + `zodResolver`, `z.input` vs `z.output`, `superRefine`, `setValue`/`watch`.
- `12-form-wizard.tsx`: Multi-step wizard, one form, each step owns a slice; `FormProvider`, `useFormContext`, `useWatch`, discriminated union.
- `13-tanstack-query.tsx`: `useQuery`, `useMutation`, query keys, invalidation, `keepPreviousData`, against a fake API.
- `14-apollo-graphql.tsx`: Apollo Client 4 `useQuery` with a mocked link.
- `15-jotai-atoms.tsx`: Atoms, `useAtomValue`/`useSetAtom`, derived atoms, `Provider`; context vs atoms vs server cache.
- `16-performance.tsx`: `memo`, `useMemo`, `useCallback`, keys, `useDeferredValue`, `useTransition`.
- `17-error-boundary-suspense-use.tsx`: Error boundary class, `Suspense`, React 19 `use`.

Run any of them with `npm run lesson -- NN` (01 to 17).

## Layout

```
hello-react/
  index.html          # fixed HTML shell
  main.tsx             # loads the lesson selected by the runner
  scripts/run-lesson.mjs
  public/             # static assets (favicon, etc.)
  01-hello-world.tsx  # lessons, flat, one file per step
  ...
  17-error-boundary-suspense-use.tsx
  08-styling.module.css
```
