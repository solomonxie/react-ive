# TypeScript + React: a progressive learning path

A single Vite + TypeScript + React project. Each numbered file is a complete,
self-contained lesson — it contains everything the previous step taught, plus
one new concept, and mounts itself.

## Setup

```sh
cd helloworld
npm install
npm run dev
```

## How to run a lesson

The app has one stable entry point. Pass the lesson number to the runner:

```sh
npm run lesson -- 01
npm run lesson -- 02
npm run lesson -- 08
```

The command starts Vite and opens the selected lesson. If you omit the number,
lesson 01 is used. You can also run `npm run dev` to start lesson 01.

## Lessons

| File | Concept | What's new |
| --- | --- | --- |
| `01-hello-world.tsx` | JSX + rendering | Smallest possible component, mounted with `createRoot` |
| `02-components-and-props.tsx` | Components & props | Splits the greeting into a reusable `<Greeting name>` component with typed props |
| `03-state-and-events.tsx` | State & events | `useState` for a controlled input and a click counter |
| `04-effects-and-fetching.tsx` | Effects & data fetching | `useEffect` + `fetch` with typed response, loading/error states |
| `05-routing.tsx` | Routing | `react-router-dom` with static and dynamic (`/user/:id`) routes |
| `06-context-and-guards.tsx` | Context & route guards ("middleware") | Auth `Context` + a `ProtectedRoute` wrapper that redirects, the closest React analogue to server-side middleware |
| `07-forms.tsx` | Forms | Controlled inputs, typed form state, validation on submit |
| `08-styling.tsx` | Styling | CSS Modules (`08-styling.module.css`) applied to existing components |

## Layout

```
helloworld/
  index.html          # fixed HTML shell
  main.tsx             # loads the lesson selected by the runner
  scripts/run-lesson.mjs
  public/             # static assets (favicon, etc.)
  01-hello-world.tsx  # lessons, flat, one file per step
  ...
  08-styling.module.css
```
