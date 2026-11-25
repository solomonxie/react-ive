// Zod Basics — check data at runtime and get its type from the same definition.
// Goal: learn parse vs safeParse, how to read errors, and z.infer.
//
// Lessons 04-07 were about types TypeScript checks while you write code. Data
// that comes from outside (JSON, a form, an HTTP request) is `unknown` until
// something checks it while the program runs. A zod schema does that check,
// and z.infer turns the very same schema into a TypeScript type, so the
// runtime check and the type can never drift apart.
//
// In real projects you'll usually see a schema file export the schema and,
// right below it, `export type Thing = z.infer<typeof thingSchema>`, so the
// rest of the code imports the type and never writes it by hand.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 09

import { z } from 'zod'

const ExportColumn = z.object({
  id: z.string(),
  label: z.string().min(1, "Label can't be empty"),
  position: z.number().int().min(0),
  isSelected: z.boolean(),
})

// The type comes from the schema. Hover it: { id: string; label: string; ... }
// Naming the type the same as the schema is common; TypeScript keeps values
// and types in separate namespaces.
type ExportColumn = z.infer<typeof ExportColumn>

// --- parse: returns typed data, or throws ---------------------------------

const fromJson: unknown = JSON.parse('{"id":"spend","label":"Spend","position":0,"isSelected":true}')
const column: ExportColumn = ExportColumn.parse(fromJson)
console.log('parse ok:', column)

const bad = { id: 'spend', label: '', position: 1.5, isSelected: 'yes' }

try {
  ExportColumn.parse(bad)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(`parse threw a ZodError with ${error.issues.length} issues`)
  }
}

// --- safeParse: never throws, returns a result to check -------------------

// The result is a discriminated union on `success` (lesson 04): inside each
// branch TypeScript knows whether you have `data` or `error`.
const result = ExportColumn.safeParse(bad)

if (result.success) {
  console.log('valid:', result.data.label)
} else {
  // 1. The raw issues: each has a path, a code and a message.
  console.log('\nissues:')
  for (const issue of result.error.issues) {
    console.log(`  ${issue.path.join('.')}: [${issue.code}] ${issue.message}`)
  }

  // 2. Grouped by field, the shape a form wants.
  console.log('\nfieldErrors:', z.flattenError(result.error).fieldErrors)

  // 3. A readable multi-line string, handy for logs.
  console.log('\nprettifyError:\n' + z.prettifyError(result.error))
}

// --- unknown keys -----------------------------------------------------------

// z.object drops keys it doesn't know about. z.strictObject rejects them.
// You'll also see `.strict()` on an object schema, which does the same.
const withExtra = { ...column, color: 'red' }
console.log('\nz.object strips extras:', ExportColumn.parse(withExtra))
const strict = z.strictObject(ExportColumn.shape).safeParse(withExtra)
console.log('z.strictObject rejects them:', strict.success ? 'ok' : strict.error.issues[0]?.message)
