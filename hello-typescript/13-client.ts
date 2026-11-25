// The client side of lesson 13: what a frontend would do. It runs the shared
// schema's safeParse on the editor's state before saving, so the user sees
// errors without a round trip to the server.

import { z } from 'zod'
import {
  PageGroupingSchema,
  SavedPageGroupingSchema,
  type PageGrouping,
  type SavedPageGrouping,
} from './13-shared-schema'

export type SaveResult =
  | { ok: true; grouping: SavedPageGrouping }
  | { ok: false; where: 'client' | 'server'; errors: string[] }

const describeIssues = (issues: readonly z.core.$ZodIssue[]) =>
  issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)

export async function saveGrouping(baseUrl: string, draft: PageGrouping, skipClientCheck = false): Promise<SaveResult> {
  // 1. Same schema, checked in the browser first for instant feedback.
  if (!skipClientCheck) {
    const checked = PageGroupingSchema.safeParse(draft)
    if (!checked.success) {
      return { ok: false, where: 'client', errors: describeIssues(checked.error.issues) }
    }
  }

  const response = await fetch(`${baseUrl}/groupings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(draft),
  })
  const body: unknown = await response.json()

  if (!response.ok) {
    const issues = z.object({ issues: z.array(z.any()) }).safeParse(body)
    return { ok: false, where: 'server', errors: issues.success ? describeIssues(issues.data.issues) : [String(body)] }
  }

  // 2. And again on the way back. parse() runs the codec forward (decode),
  // so updatedAt turns back into a real Date.
  return { ok: true, grouping: SavedPageGroupingSchema.parse(body) }
}
