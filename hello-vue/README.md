# Vue from Scratch

A single Vite + TypeScript + Vue project. Each numbered file is a complete,
self-contained lesson — it contains everything the previous step taught, plus
one new concept, and mounts itself.

## Setup

```sh
cd hello-vue
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
| `01-hello-world.vue` | SFC + rendering | Smallest possible component, mounted with `createApp` |
| `02-components-and-props.vue` | Components & props | A reusable `Greeting` component, plus this file's own root props typed via `defineProps()` |
| `03-reactivity.vue` | Reactivity & events | `ref`/`reactive` state, `v-model`, and a typed custom event via `defineEmits()` |
| `04-effects-and-fetching.vue` | Effects & data fetching | `watch` and `watchEffect`, `fetch` with typed loading/error/success state |
| `05-routing.vue` | Routing | `vue-router` with static and dynamic (`/user/:id`) routes |

## Layout

```
hello-vue/
  index.html                     # fixed HTML shell
  main.ts                        # loads the lesson selected by the runner
  env.d.ts                       # *.vue module typing
  scripts/run-lesson.mjs
  public/                        # static assets (favicon, etc.)
  01-hello-world.vue             # lessons, flat, one file per step
  ...
  05-routing.vue
```
