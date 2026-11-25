// Unions and Custom Rules — one of several shapes, plus rules that span fields.
// Goal: learn z.discriminatedUnion, .refine, and .superRefine.
//
// Lesson 04 narrowed a `Shape` union by its `kind` field. z.discriminatedUnion
// is the runtime version: zod reads the shared literal field, picks the
// matching branch, and only reports that branch's errors.
//
// Some rules aren't about one field's type at all ("pick at least one
// column", "end date after start date"). .refine and .superRefine add those.
//
// The example is a data export form: where the file goes (a GCS or an S3
// bucket) and which columns it has. Forms like this are where these tools
// earn their keep, because each error needs to land next to the right input.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 11

import { z } from 'zod'

// --- discriminated union: a GCS or an S3 destination ----------------------

// .refine(check, message): one yes/no rule. If the check returns false, you
// get one issue with your message.
const bucketValid = z.boolean().refine((valid) => valid, {
  message: 'Please provide the correct permissions to your bucket',
})

const GcsDestination = z.object({
  type: z.literal('GCS'),
  bucketName: z.string().min(3, 'Bucket name must be at least 3 characters long'),
  isBucketValid: bucketValid,
})

const S3Destination = z.object({
  type: z.literal('S3'),
  bucketName: z.string().min(3, 'Bucket name must be at least 3 characters long'),
  awsRole: z.string().min(1, 'AWS role is required'),
  bucketRegion: z.string().min(1, 'Bucket region is required'),
  isBucketValid: bucketValid,
})

const Destination = z.discriminatedUnion('type', [GcsDestination, S3Destination])
type Destination = z.infer<typeof Destination>

// The inferred type narrows exactly like lesson 04's Shape.
function describe(destination: Destination): string {
  switch (destination.type) {
    case 'GCS':
      return `gs://${destination.bucketName}`
    case 'S3':
      return `s3://${destination.bucketName} (${destination.bucketRegion}, as ${destination.awsRole})`
  }
}

const s3 = Destination.parse({
  type: 'S3',
  bucketName: 'my-exports',
  awsRole: 'arn:aws:iam::123:role/export',
  bucketRegion: 'us-east-1',
  isBucketValid: true,
})
console.log(describe(s3))

// Only S3's errors come back, because type: 'S3' picked that branch.
const missingRole = Destination.safeParse({ type: 'S3', bucketName: 'nb', bucketRegion: '', isBucketValid: false })
console.log('\nS3 with problems:')
for (const issue of missingRole.error?.issues ?? []) {
  console.log(`  ${issue.path.join('.')}: ${issue.message}`)
}

// An unknown type fails on the discriminator itself.
const azure = Destination.safeParse({ type: 'AZURE', bucketName: 'x' })
console.log('\nunknown type:', azure.error?.issues[0]?.message)

// --- superRefine: rules across fields, with your own paths ----------------

// .refine gives you one issue. .superRefine hands you a context so you can add
// as many issues as you like, each on the field the user should fix. This is
// how a form shows the error next to the right input.
const ExportColumn = z.object({ id: z.string(), label: z.string(), isSelected: z.boolean() })

const ReportData = z
  .object({
    exportColumns: z.array(ExportColumn),
    availableColumnIds: z.array(z.string()),
  })
  .superRefine(({ exportColumns, availableColumnIds }, ctx) => {
    const selected = exportColumns.filter((column) => column.isSelected)
    if (selected.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['exportColumns'], message: 'Pick at least one column' })
    }
    const available = new Set(availableColumnIds)
    selected.forEach((column, index) => {
      if (!available.has(column.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['exportColumns', index, 'id'],
          message: `Column "${column.id}" is no longer available`,
        })
      }
    })
  })

const none = ReportData.safeParse({
  exportColumns: [{ id: 'spend', label: 'Spend', isSelected: false }],
  availableColumnIds: ['spend'],
})
console.log('\nnothing picked:', z.flattenError(none.error!).fieldErrors)

const stale = ReportData.safeParse({
  exportColumns: [
    { id: 'spend', label: 'Spend', isSelected: true },
    { id: 'old_metric', label: 'Old', isSelected: true },
  ],
  availableColumnIds: ['spend'],
})
console.log('stale column:', stale.error?.issues.map((i) => `${i.path.join('.')}: ${i.message}`))

// Gotcha: refinements on an object only run once every field in it passes its
// own checks. If exportColumns had a wrong type, you'd see that error alone
// and "Pick at least one column" would wait until it was fixed.
const brokenShape = ReportData.safeParse({ exportColumns: 'oops', availableColumnIds: [] })
console.log('\nwrong shape first:', brokenShape.error?.issues.map((i) => i.message))
