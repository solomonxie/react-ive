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

## How to advance

Open `index.html` and change the one `<script>` line to the next file:

```html
<script type="module" src="/02-components-and-props.tsx"></script>
```

Save, reload the browser, and read the diff between that file and the
previous one to see what's new.

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
  index.html          # dev entry — script src picks the active lesson
  public/             # static assets (favicon, etc.)
  01-hello-world.tsx  # lessons, flat, one file per step
  ...
  08-styling.module.css
```
