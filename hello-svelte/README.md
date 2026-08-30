# Svelte 5: a progressive learning path

A single Vite + TypeScript + Svelte project. Each numbered `.svelte` file is
a complete, self-contained lesson — it contains everything the previous step
taught, plus one new concept, and is mounted on its own with Svelte 5's
`mount()`.

## Setup

```sh
cd hello-svelte
npm install
npm run dev
```

## How to run a lesson

The app has one stable entry point. Pass the lesson number to the runner:

```sh
npm run lesson -- 01
npm run lesson -- 02
npm run lesson -- 05
```

The command starts Vite and opens the selected lesson. If you omit the
number, lesson 01 is used. You can also run `npm run dev` to start lesson 01.

## Lessons

| File | Concept | What's new |
| --- | --- | --- |
| `01-hello-world.svelte` | Rendering | Smallest possible component, mounted with Svelte 5's `mount()` |
| `02-components-and-props.svelte` | Components & props | Splits the greeting into a reusable `<Greeting name>` component using the `$props()` rune |
| `03-reactivity.svelte` | Reactivity & events | `$state` for a controlled input and a click counter, `$derived` for a value computed from state |
| `04-stores.svelte` | Stores | Writable/derived stores from `svelte/store`, `$store` auto-subscription, and a `fetch()` that writes into a store |
| `05-routing.svelte` | Routing | `svelte-routing` with static routes and a dynamic (`/user/:id`) route, `$effect` refetching when the route param changes |

Lessons that need a small helper component (a `Greeting`, or lesson 05's
`UserInfo`) keep their own copy right next to them (`02-greeting.svelte`,
`03-greeting.svelte`, ...) so each lesson stays self-contained rather than
sharing state or files across steps.

## Layout

```
hello-svelte/
  index.html               # fixed HTML shell
  main.ts                   # loads the lesson selected by the runner
  scripts/run-lesson.mjs
  public/                   # static assets (favicon, etc.)
  01-hello-world.svelte    # lessons, flat, one file per step
  02-components-and-props.svelte
  02-greeting.svelte        # helper component local to lesson 02
  ...
  05-routing.svelte
  05-greeting.svelte
  05-user-info.svelte
```
