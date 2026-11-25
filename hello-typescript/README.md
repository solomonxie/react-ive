# TypeScript: a progressive learning path

A progressive path through TypeScript itself: types, functions, interfaces,
unions, generics, classes, utility types, async/modules, and runtime checks
with zod — no framework, no browser. Each numbered `.ts` file is a complete,
runnable program (lessons 08 and 13 import helper files kept next to them).

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

- `01-hello-world.ts`: Basic types. Type inference vs. explicit annotation on primitives and arrays.
- `02-functions.ts`: Functions. Typed params/return, optional & default params, rest params, arrow functions.
- `03-interfaces-and-types.ts`: Interfaces & type aliases. Object shapes, `readonly`/optional fields, `extends`.
- `04-union-and-narrowing.ts`: Union types & narrowing. Literal types, `typeof` narrowing, discriminated unions.
- `05-generics.ts`: Generics. Generic functions/interfaces, constraining a type parameter with `extends`.
- `06-classes.ts`: Classes. Access modifiers, `readonly` fields, inheritance, `implements`.
- `07-utility-types.ts`: Utility types. `Partial`, `Pick`, `Omit`, `Record`, `Readonly`.
- `08-async-and-modules.ts`: Async & modules. `async`/`await`, `Promise<T>`, `import`/`export` across files (`08-math-utils.ts`).

Lesson 08 imports a small helper module (`08-math-utils.ts`) kept right next
to it, so the lesson itself stays focused on async/import syntax rather than
the helper's logic.

### Zod: checking data at runtime

TypeScript only checks your code while you write it. Data from outside (JSON,
a form, an HTTP request) needs checking while the program runs. Zod does that
check, and gives you the TypeScript type from the same schema, so lessons
09-13 build straight on 04-07. They use zod 4.5, and each file says where you'd
meet the same thing in a real project.

- `09-zod-basics.ts`: Zod basics. `parse` vs `safeParse`, reading errors (`issues`, `z.flattenError`, `z.prettifyError`), `z.infer`, stripping vs rejecting unknown keys.
- `10-shaping-schemas.ts`: Shaping schemas. `.optional()` vs `.nullable()`, `.default()`, and lesson 07's utility types as `.pick()`, `.omit()`, `.partial()`, `.extend()`, `z.record()`, `.readonly()`. Also why `.partial()` keeping defaults can bite a PATCH body.
- `11-unions-and-custom-rules.ts`: Unions and custom rules. `z.discriminatedUnion` for a GCS or S3 destination, `.refine` for one rule, `.superRefine` for rules across fields like "pick at least one column", with each error on the right field.
- `12-transforms-and-codecs.ts`: Transforms and codecs. `z.input` vs `z.output`, `.transform`, `z.coerce` (and why `z.stringbool()` beats `z.coerce.boolean()`), and `z.codec`. Shows why a one-way `.transform` throws when fastify-type-provider-zod v7 encodes a response, which is why hello-fastify lesson 07 uses a codec for dates.
- `13-one-schema-two-sides.ts`: One schema, two sides. A shared schema module (`13-shared-schema.ts`, the kind of "common" package a monorepo has) imported by a small API (`13-api.ts`) and a client (`13-client.ts`). The client checks before sending, the API checks again because anyone can call it, and the codec turns dates into strings and back.

Zod also shows up elsewhere in this repo:

- hello-react `11-react-hook-form-zod.tsx` and `12-form-wizard.tsx`: zod schemas driving react-hook-form.
- hello-fastify `03-zod-validation.ts` and `07-notes-app.ts`: zod on Fastify routes.
- hello-jest `src/export-schema.ts`: testing a zod schema.
