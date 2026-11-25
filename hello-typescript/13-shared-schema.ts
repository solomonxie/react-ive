// The shared module for lesson 13. In a monorepo this would be its own
// package (often called "common" or "shared"): no server code, no browser
// code, just schemas, the types inferred from them, and a validate helper
// for the API, so both sides can import it.

import { z } from 'zod'

const nameKey = (name: string) => name.trim().toLowerCase()

const isoDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (text) => new Date(text),
  encode: (date) => date.toISOString(),
})

export const PageGroupSchema = z.strictObject({
  name: z.string().trim().min(1, 'A group name is required'),
  urlContains: z.string().trim().min(1, 'A value is required'),
})

export const PageGroupingSchema = z
  .strictObject({
    name: z.string().trim().min(1, 'A grouping name is required'),
    groups: z.array(PageGroupSchema).min(1, 'Add at least one group'),
  })
  // Report rows are keyed by group name, so names must be unique.
  .superRefine((grouping, ctx) => {
    const seen = new Set<string>()
    grouping.groups.forEach(({ name }, index) => {
      if (seen.has(nameKey(name))) {
        ctx.addIssue({
          code: 'custom',
          path: ['groups', index, 'name'],
          message: `Group name "${name}" is used by another group`,
        })
      }
      seen.add(nameKey(name))
    })
  })

// What the API sends back: the grouping plus fields only the server sets.
export const SavedPageGroupingSchema = PageGroupingSchema.safeExtend({
  id: z.number().int(),
  updatedAt: isoDate,
})

export type PageGrouping = z.infer<typeof PageGroupingSchema>
export type SavedPageGrouping = z.output<typeof SavedPageGroupingSchema>

// The API's entry point: anything off the network is unknown until checked.
export function validatePageGrouping(input: unknown): PageGrouping {
  return PageGroupingSchema.parse(input)
}
