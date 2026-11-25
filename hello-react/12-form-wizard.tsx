// A multi-step wizard where each step owns its slice of one shared form.
// Patterns common in larger production forms:
//   one sub-schema per step, joined in z.object
//   a provider: useForm + zodResolver + FormProvider
//   a step registry with visited steps, useWatch, useMemo
//   z.discriminatedUnion("type", ...)
//
// Ideas:
// - ONE useForm at the top, shared through FormProvider. Steps call useFormContext().
// - Each step module exports its schema slice and getStatus/getSummary functions.
//   The wizard shell stays generic: it just loops over a registry array.
// - useWatch subscribes to just the fields you name, so only that component re-renders.
// - All steps stay mounted-or-not freely because values live in the form, not in the step.
// - A step is hidden when it does not apply (recipients only for scheduled exports).
//
// Run:  npm run lesson -- 12
// Open: http://localhost:5173/

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { z } from 'zod'

// ---- schema: one slice per step -------------------------------------------

const reportSchema = z.object({
  type: z.enum(['TOUCHPOINTS', 'ORDERS']),
  columns: z.array(z.string()).min(1, 'Pick at least one column'),
})

const destinationSchema = z.object({
  bucketName: z.string().min(3, 'Bucket name is too short'),
  fileName: z.string().min(1, 'File name is required'),
})

// Discriminated union: the "type" field decides which other fields exist.
const triggerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('IMMEDIATE') }),
  z.object({ type: z.literal('SCHEDULED'), time: z.string().min(1, 'Pick a time') }),
])

const recipientsSchema = z.array(z.email('Not a valid email'))

const wizardSchema = z
  .object({
    report: reportSchema,
    destination: destinationSchema,
    trigger: triggerSchema,
    recipients: recipientsSchema,
  })
  // Cross-step rule: scheduled exports need at least one recipient.
  .superRefine((values, context) => {
    if (values.trigger.type === 'SCHEDULED' && values.recipients.length === 0) {
      context.addIssue({ code: 'custom', path: ['recipients'], message: 'Add at least one recipient' })
    }
  })

type WizardValues = z.input<typeof wizardSchema>
type WizardOutput = z.output<typeof wizardSchema>

const COLUMNS = ['date', 'channel', 'spend', 'revenue']

// ---- per-step status and summary (pure functions of the form values) -------

type StepStatus = 'complete' | 'warning'
const statusOf = (isValid: boolean): StepStatus => (isValid ? 'complete' : 'warning')

const getReportStatus = (v: WizardValues) => statusOf(reportSchema.safeParse(v.report).success)
const getReportSummary = (v: WizardValues) => `${v.report.type}, ${v.report.columns.length} columns`
const getDestinationStatus = (v: WizardValues) => statusOf(destinationSchema.safeParse(v.destination).success)
const getDestinationSummary = (v: WizardValues) => v.destination.bucketName || 'No bucket yet'
const getTriggerStatus = (v: WizardValues) => statusOf(triggerSchema.safeParse(v.trigger).success)
const getTriggerSummary = (v: WizardValues) => (v.trigger.type === 'IMMEDIATE' ? 'Run now' : `Daily at ${v.trigger.time || '?'}`)
const getRecipientsStatus = (v: WizardValues) => statusOf(recipientsSchema.safeParse(v.recipients).success && v.recipients.length > 0)
const getRecipientsSummary = (v: WizardValues) => `${v.recipients.length} recipient(s)`

// Registry: the shell is generic, each step contributes its own rules.
const STEPS = [
  { id: 'report', label: 'Report', getStatus: getReportStatus, getSummary: getReportSummary },
  { id: 'destination', label: 'Destination', getStatus: getDestinationStatus, getSummary: getDestinationSummary },
  { id: 'trigger', label: 'When', getStatus: getTriggerStatus, getSummary: getTriggerSummary },
  { id: 'recipients', label: 'Recipients', getStatus: getRecipientsStatus, getSummary: getRecipientsSummary },
] as const
type StepId = (typeof STEPS)[number]['id']

// ---- the steps hook (a typical steps hook) -----------------------

function useWizardSteps() {
  const { control } = useFormContext<WizardValues>()
  const [requested, setRequested] = useState<StepId>('report')
  const [visited, setVisited] = useState<Set<StepId>>(() => new Set<StepId>(['report']))

  const navigate = useCallback((id: StepId) => {
    setRequested(id)
    setVisited((previous) => (previous.has(id) ? previous : new Set(previous).add(id)))
  }, [])

  // Subscribes to these four top-level slices only.
  const [report, destination, trigger, recipients] = useWatch({
    control,
    name: ['report', 'destination', 'trigger', 'recipients'],
  })
  const isScheduled = trigger?.type === 'SCHEDULED'

  // If the user is on Recipients and switches to "Run now", fall back to the previous step.
  const activeId: StepId = requested === 'recipients' && !isScheduled ? 'trigger' : requested

  const steps = useMemo(() => {
    const values = { report, destination, trigger, recipients } as WizardValues
    return STEPS.filter((step) => step.id !== 'recipients' || isScheduled).map((step) => {
      const isVisited = visited.has(step.id)
      return {
        id: step.id,
        label: step.label,
        summary: isVisited ? step.getSummary(values) : undefined,
        status: isVisited && step.id !== activeId ? step.getStatus(values) : undefined,
      }
    })
  }, [report, destination, trigger, recipients, visited, activeId, isScheduled])

  return { steps, activeId, navigate }
}

// ---- step components: each only knows its own slice ------------------------

function ReportStep() {
  const { register, formState: { errors } } = useFormContext<WizardValues>()
  return (
    <fieldset>
      <legend>Report</legend>
      <select {...register('report.type')}>
        <option value="TOUCHPOINTS">Touchpoints</option>
        <option value="ORDERS">Orders</option>
      </select>
      <div>
        {COLUMNS.map((column) => (
          <label key={column} style={{ marginRight: 8 }}>
            <input type="checkbox" value={column} {...register('report.columns')} /> {column}
          </label>
        ))}
      </div>
      {errors.report?.columns && <em style={{ color: 'crimson' }}>{errors.report.columns.message}</em>}
    </fieldset>
  )
}

function DestinationStep() {
  const { register, formState: { errors } } = useFormContext<WizardValues>()
  return (
    <fieldset>
      <legend>Destination</legend>
      <label>Bucket <input {...register('destination.bucketName')} /></label>
      {errors.destination?.bucketName && <em style={{ color: 'crimson' }}> {errors.destination.bucketName.message}</em>}
      <br />
      <label>File name <input {...register('destination.fileName')} /></label>
      {errors.destination?.fileName && <em style={{ color: 'crimson' }}> {errors.destination.fileName.message}</em>}
    </fieldset>
  )
}

function TriggerStep() {
  const { register, setValue, formState: { errors } } = useFormContext<WizardValues>()
  const triggerType = useWatch<WizardValues, 'trigger.type'>({ name: 'trigger.type' })
  return (
    <fieldset>
      <legend>When</legend>
      <label>
        <input
          type="radio"
          checked={triggerType === 'IMMEDIATE'}
          // Replace the whole slice: a discriminated union needs a coherent object.
          onChange={() => setValue('trigger', { type: 'IMMEDIATE' }, { shouldValidate: true })}
        />{' '}
        Run now
      </label>
      <label>
        <input
          type="radio"
          checked={triggerType === 'SCHEDULED'}
          onChange={() => setValue('trigger', { type: 'SCHEDULED', time: '' }, { shouldValidate: true })}
        />{' '}
        Scheduled
      </label>
      {triggerType === 'SCHEDULED' && (
        <div>
          <input type="time" {...register('trigger.time')} />
          {'time' in (errors.trigger ?? {}) && <em style={{ color: 'crimson' }}> Pick a time</em>}
        </div>
      )}
    </fieldset>
  )
}

function RecipientsStep() {
  const { setValue, formState: { errors } } = useFormContext<WizardValues>()
  const recipients = useWatch<WizardValues, 'recipients'>({ name: 'recipients' })
  const [draft, setDraft] = useState('')
  return (
    <fieldset>
      <legend>Recipients</legend>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="name@example.com" />
      <button
        type="button"
        onClick={() => {
          setValue('recipients', [...recipients, draft], { shouldValidate: true })
          setDraft('')
        }}
      >
        Add
      </button>
      <ul>{recipients.map((email, index) => <li key={`${email}-${index}`}>{email}</li>)}</ul>
      {errors.recipients && <em style={{ color: 'crimson' }}>{errors.recipients.message ?? 'Check the emails'}</em>}
    </fieldset>
  )
}

const STEP_COMPONENTS: Record<StepId, () => React.JSX.Element> = {
  report: ReportStep,
  destination: DestinationStep,
  trigger: TriggerStep,
  recipients: RecipientsStep,
}

// ---- shell -----------------------------------------------------------------

function Wizard() {
  const { handleSubmit, formState: { isValid } } = useFormContext<WizardValues, unknown, WizardOutput>()
  const { steps, activeId, navigate } = useWizardSteps()
  const ActiveStep = STEP_COMPONENTS[activeId]

  return (
    <form onSubmit={handleSubmit((values) => alert(JSON.stringify(values, null, 2)))}>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => navigate(step.id)}
            style={{ fontWeight: step.id === activeId ? 700 : 400, textAlign: 'left' }}
          >
            {step.status === 'complete' && 'OK '}
            {step.status === 'warning' && '! '}
            {step.label}
            {step.summary && <small style={{ display: 'block' }}>{step.summary}</small>}
          </button>
        ))}
      </nav>
      <ActiveStep />
      <p>
        <button type="submit" disabled={!isValid}>Save export</button>
      </p>
    </form>
  )
}

function App() {
  const form = useForm<WizardValues, unknown, WizardOutput>({
    resolver: zodResolver(wizardSchema),
    mode: 'onChange',
    defaultValues: {
      report: { type: 'TOUCHPOINTS', columns: [] },
      destination: { bucketName: '', fileName: 'report' },
      trigger: { type: 'IMMEDIATE' },
      recipients: [],
    },
  })
  return (
    <FormProvider {...form}>
      <h1>Form wizard</h1>
      <Wizard />
    </FormProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
