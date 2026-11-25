import { z } from 'zod'

// A tiny version of the kind of export form schema a real app has.
export const exportSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.email('Enter a valid email'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  })

export type ExportValues = z.infer<typeof exportSchema>
