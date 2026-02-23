/** Fields allowed when creating/updating a job via API (matches Payload Jobs collection). */
const JOB_FIELDS = [
  'jobType',
  'jobNumber',
  'jobName',
  'customerName',
  'jobLocation',
  'projectManager',
  'status',
  'dateStarted',
  'description',
  'fileLocationPath',
  'attachments',
] as const

export function sanitizeJobBody(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of JOB_FIELDS) {
    if (key in body && body[key] !== undefined) {
      out[key] = body[key]
    }
  }
  return out
}
