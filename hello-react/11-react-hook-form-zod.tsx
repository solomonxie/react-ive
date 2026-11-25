// react-hook-form + zod: one schema is the source of truth for validation and types.
// Patterns common in larger production forms:
//   a schema built as a z.object of slices (z.infer / z.input)
//   superRefine with addIssue and a path
//   useForm + zodResolver + defaultValues
//
// Ideas:
// - zodResolver(schema) runs zod on every validation and puts issues on the matching field.
// - z.input is the type BEFORE parsing (what the form holds); z.infer/z.output is AFTER
//   (what onSubmit receives). They differ when a schema coerces or transforms.
// - superRefine checks rules that involve several fields; `path` says which field shows the error.
// - setValue / watch / getValues for programmatic changes; register for plain inputs.
//
// Run:  npm run lesson -- 11
// Open: http://localhost:5173/

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createRoot } from 'react-dom/client'
import { z } from 'zod'

const exportSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    reportType: z.enum(['TOUCHPOINTS', 'ORDERS']),
    fileName: z.string().min(1, 'File name is required'),
    // An <input> gives a string; coerce turns it into a number. This is why input and output types differ.
    maxRows: z.coerce.number().int().positive('Must be positive'),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
  })
  // Cross-field rule: needs two fields, so it lives on the object.
  .superRefine((values, context) => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      context.addIssue({ code: 'custom', path: ['endDate'], message: 'End must be after start' })
    }
  })

type ExportInput = z.input<typeof exportSchema> // what the form holds
type ExportOutput = z.output<typeof exportSchema> // what onSubmit gets

// The usual three generics: values, context, transformed output.
function ExportForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ExportInput, unknown, ExportOutput>({
    resolver: zodResolver(exportSchema),
    mode: 'onChange',
    defaultValues: { name: 'Touchpoints export', reportType: 'TOUCHPOINTS', fileName: 'touchpoints-report', maxRows: 100 },
  })

  const reportType = watch('reportType')

  // Changing the report type renames the defaults, but only
  // if the user has not typed their own name.
  function onReportTypeChange(next: ExportInput['reportType']) {
    setValue('reportType', next, { shouldValidate: true })
    const known = ['touchpoints-report', 'orders-report']
    if (known.includes(getValues('fileName'))) {
      setValue('fileName', `${next.toLowerCase()}-report`, { shouldValidate: true })
    }
  }

  async function onSubmit(values: ExportOutput) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    alert(`Saved (maxRows is a ${typeof values.maxRows}): ${JSON.stringify(values, null, 2)}`)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
      <label>
        Name <input {...register('name')} />
        {errors.name && <em style={{ color: 'crimson' }}> {errors.name.message}</em>}
      </label>
      <label>
        Report type{' '}
        <select value={reportType} onChange={(event) => onReportTypeChange(event.target.value as ExportInput['reportType'])}>
          <option value="TOUCHPOINTS">Touchpoints</option>
          <option value="ORDERS">Orders</option>
        </select>
      </label>
      <label>
        File name <input {...register('fileName')} />
        {errors.fileName && <em style={{ color: 'crimson' }}> {errors.fileName.message}</em>}
      </label>
      <label>
        Max rows <input type="number" {...register('maxRows')} />
        {errors.maxRows && <em style={{ color: 'crimson' }}> {errors.maxRows.message}</em>}
      </label>
      <label>
        Start <input type="date" {...register('startDate')} />
        {errors.startDate && <em style={{ color: 'crimson' }}> {errors.startDate.message}</em>}
      </label>
      <label>
        End <input type="date" {...register('endDate')} />
        {errors.endDate && <em style={{ color: 'crimson' }}> {errors.endDate.message}</em>}
      </label>
      <div>
        <button type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={() => reset()}>Reset</button>
      </div>
    </form>
  )
}

createRoot(document.getElementById('root')!).render(
  <>
    <h1>react-hook-form + zod</h1>
    <ExportForm />
  </>,
)
