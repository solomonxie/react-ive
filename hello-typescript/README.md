# TypeScript: a progressive learning path

A progressive path through TypeScript itself: types, functions, interfaces,
unions, generics, classes, utility types, and async/modules — no framework,
no browser. Each numbered `.ts` file is a complete, self-contained, runnable
program.

## Setup

```sh
cd hello-typescript
npm install
```

## How to run a lesson

```sh
npm run lesson -- 01
npm run lesson -- 05
```

If you omit the number, lesson 01 runs. Each lesson prints its output to the
terminal via `tsx` (TypeScript run directly, no separate build step).

## Lessons

| File | Concept | What's new |
| --- | --- | --- |
| `01-hello-world.ts` | Basic types | Type inference vs. explicit annotation on primitives and arrays |
| `02-functions.ts` | Functions | Typed params/return, optional & default params, rest params, arrow functions |
| `03-interfaces-and-types.ts` | Interfaces & type aliases | Object shapes, `readonly`/optional fields, `extends` |
| `04-union-and-narrowing.ts` | Union types & narrowing | Literal types, `typeof` narrowing, discriminated unions |
| `05-generics.ts` | Generics | Generic functions/interfaces, constraining a type parameter with `extends` |
| `06-classes.ts` | Classes | Access modifiers, `readonly` fields, inheritance, `implements` |
| `07-utility-types.ts` | Utility types | `Partial`, `Pick`, `Omit`, `Record`, `Readonly` |
| `08-async-and-modules.ts` | Async & modules | `async`/`await`, `Promise<T>`, `import`/`export` across files (`08-math-utils.ts`) |

Lesson 08 imports a small helper module (`08-math-utils.ts`) kept right next
to it, so the lesson itself stays focused on async/import syntax rather than
the helper's logic.
