// Shaping Schemas — optional and nullable fields, defaults, and building new
// schemas out of old ones.
// Goal: learn the zod versions of lesson 07's utility types.
//
// Lesson 07 built new types with Partial, Pick, Omit and Record. Zod has the
// same moves on schemas, so you get a new runtime check and its type at once.
//
// Things you'll meet in real code:
//   - `z.union([z.string(), z.null()])`, the long way to write .nullable().
//   - a base schema shared by several variants, each one `base.extend({ ... })`.
//   - `.nullable().default(null)` for "may be missing, and then means null".
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 10

import { z } from 'zod'

const ScheduledExport = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  // .nullable(): the key must be there, but its value may be null.
  fileName: z.string().nullable(),
  // .optional(): the key may be missing (or undefined).
  notes: z.string().optional(),
  // .default(): if the key is missing, zod fills it in.
  format: z.enum(['csv', 'parquet']).default('csv'),
})

type ScheduledExport = z.infer<typeof ScheduledExport>
// { id: number; name: string; fileName: string | null; notes?: string | undefined;
//   format: "csv" | "parquet" }

// A default makes the key optional going in but always present coming out.
// Lesson 12 looks at this "input vs output" split properly.
type ScheduledExportInput = z.input<typeof ScheduledExport>
const input: ScheduledExportInput = { id: 1, name: 'Daily spend', fileName: null }
console.log('default filled in:', ScheduledExport.parse(input))

// Missing vs null are different things:
console.log('fileName missing:', ScheduledExport.safeParse({ id: 1, name: 'x' }).success)
console.log('notes missing:   ', ScheduledExport.safeParse({ id: 1, name: 'x', fileName: null }).success)

// --- lesson 07's utility types, as schema methods --------------------------

// Pick<T, K>  ->  .pick()
const ExportSummary = ScheduledExport.pick({ id: true, name: true })

// Omit<T, K>  ->  .omit(): a "create" body has no id yet.
const NewExport = ScheduledExport.omit({ id: true })

// Partial<T>  ->  .partial(): a PATCH body where every field is optional.
const ExportPatch = NewExport.partial()

// interface B extends A (lesson 03)  ->  .extend()
const S3Export = ScheduledExport.extend({
  awsRole: z.string().min(1, 'AWS role is required'),
  bucketRegion: z.string().min(1, 'Bucket region is required'),
})

// Record<K, V>  ->  z.record()
const ExportsById = z.record(z.string(), ExportSummary)

// Readonly<T>  ->  .readonly(): the parsed object is frozen at runtime too.
const FrozenExport = ScheduledExport.readonly()

type ExportPatch = z.infer<typeof ExportPatch>
const patch: ExportPatch = { notes: 'moved to Monday' }

console.log('\npick:   ', ExportSummary.parse({ id: 7, name: 'Weekly', fileName: null, format: 'csv' }))
console.log('omit:   ', NewExport.parse({ name: 'New one', fileName: 'out.csv' }))
console.log('partial:', ExportPatch.parse(patch)) // note format: 'csv' sneaks in, see the end
console.log('extend: ', S3Export.safeParse({ id: 1, name: 'S3', fileName: null, awsRole: '' }).error?.issues.map((i) => i.message))
console.log('record: ', ExportsById.parse({ a: { id: 1, name: 'A' }, b: { id: 2, name: 'B' } }))

const frozen = FrozenExport.parse({ id: 3, name: 'Frozen', fileName: null })
console.log('readonly is frozen:', Object.isFrozen(frozen))
// frozen.name = 'x' // Error: Cannot assign to 'name' because it is a read-only property.

// Gotcha: .partial() keeps defaults. An empty PATCH still comes out with
// format: 'csv', so saving it would quietly reset a parquet export to csv.
console.log('\npartial keeps the default:', ExportPatch.parse({}))

// For a PATCH, build it from fields without defaults.
const SafePatch = NewExport.extend({ format: z.enum(['csv', 'parquet']) }).partial()
console.log('patch without defaults:  ', SafePatch.parse({}))
