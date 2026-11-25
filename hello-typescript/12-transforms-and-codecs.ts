// Transforms and Codecs — schemas that change data, not just check it.
// Goal: learn z.input vs z.output, .transform, z.coerce, and z.codec, and why
// a one-way transform breaks response validation in fastify-type-provider-zod v7.
//
// Until now a schema's output looked like its input. Once a schema converts
// values (string -> number, string -> Date), there are two types: what goes
// in (z.input) and what comes out (z.output, which is what z.infer gives you).
//
// Where this matters in real code:
//   - A form schema with transforms exports both `z.infer<...>` and
//     `z.input<...>`: react-hook-form wants the input type for the form's
//     values and hands you the output type on submit (hello-react lesson 11).
//   - `z.coerce.date()` for timestamps read back from storage as strings.
//   - `z.coerce.number().int().positive()` for numbers in a query string.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 12

import { z } from 'zod'

// --- .transform: run a function after the value passes ---------------------

// Form inputs hand you "HH:MM:SS"; the API wants "HH:MM".
const HHMM = z.iso.time({ precision: 0 }).transform((value) => value.slice(0, 5))
console.log('transform:', HHMM.parse('09:30:00'))

// A transform can change the type completely.
const CommaList = z.string().transform((text) => text.split(',').map((part) => part.trim()))
type CommaListIn = z.input<typeof CommaList> //   string
type CommaListOut = z.output<typeof CommaList> // string[]
const listIn: CommaListIn = 'spend, revenue , roas'
const listOut: CommaListOut = CommaList.parse(listIn)
console.log('transform:', listOut)

// --- z.coerce: convert first, then check -----------------------------------

// Everything in a URL query string is text. z.coerce.number() runs Number()
// on the value before checking it. Handy, but blunt: Number('') is 0.
const Page = z.coerce.number().int().positive()
console.log('\ncoerce "3":', Page.parse('3'))
console.log('coerce "abc":', Page.safeParse('abc').error?.issues[0]?.message)
console.log('coerce.boolean("false"):', z.coerce.boolean().parse('false'), '<- any non-empty string is true')
console.log('stringbool("false"):     ', z.stringbool().parse('false'), '<- reads "true"/"false"/"1"/"0" properly')

// --- input vs output on an object -------------------------------------------

const Schedule = z.object({
  name: z.string(),
  time: HHMM,
  everyDays: z.coerce.number().int().min(1).default(1),
})
type ScheduleIn = z.input<typeof Schedule>
type ScheduleOut = z.output<typeof Schedule> // same as z.infer
const formValues: ScheduleIn = { name: 'Morning', time: '07:15:00', everyDays: '2' }
const saved: ScheduleOut = Schedule.parse(formValues)
console.log('\ninput: ', formValues)
console.log('output:', saved)

// --- the one-way problem ----------------------------------------------------

// parse() runs a schema forward: JSON-ish input -> nice output (a "decode").
// Sometimes you need it backward: nice value -> JSON-ish (an "encode").
// fastify-type-provider-zod v7 does exactly that for responses: it calls
// zod's encode on whatever your handler returned, then sends the result.
//
// A .transform only knows one direction. Zod can't run it backward, so encode
// throws. hello-fastify lesson 07 hit this with a Date coming out of Postgres.

const OneWayDate = z.iso.datetime().transform((text) => new Date(text))
const NoteOneWay = z.object({ id: z.number(), createdAt: OneWayDate })

const fromDb = { id: 1, createdAt: new Date('2026-11-25T09:00:00Z') }
try {
  z.encode(NoteOneWay, fromDb)
} catch (error) {
  console.log('\none-way transform on encode:', (error as Error).message)
}

// --- z.codec: a transform that works both ways -------------------------------

// A codec names the input schema, the output schema, and a function for each
// direction. decode runs on parse (request bodies); encode runs on responses.
const isoDate = z.codec(z.iso.datetime(), z.date(), {
  decode: (text) => new Date(text),
  encode: (date) => date.toISOString(),
})
const Note = z.object({ id: z.number(), createdAt: isoDate })

const decoded = z.decode(Note, { id: 1, createdAt: '2026-11-25T09:00:00.000Z' })
console.log('\ncodec decode:', decoded, decoded.createdAt instanceof Date)

const encoded = z.encode(Note, fromDb)
console.log('codec encode:', encoded, JSON.stringify(encoded))

// Types follow the direction too: z.input is the wire format, z.output the app's.
type NoteWire = z.input<typeof Note> //  { id: number; createdAt: string }
type NoteInApp = z.output<typeof Note> // { id: number; createdAt: Date }
const wire: NoteWire = encoded
const inApp: NoteInApp = decoded
console.log('same data, two shapes:', typeof wire.createdAt, inApp.createdAt.constructor.name)
