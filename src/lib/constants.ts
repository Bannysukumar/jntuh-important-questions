import type { RegulationEntry } from '@/types/models'
import { defaultWatermarkHost, SITE_URL } from '@/lib/siteUrl'

export const SITE_NAME = 'JNTUH Important Questions'
export { SITE_URL }
/** Hostname for PDF watermark — derived from `SITE_URL` unless overridden in PDF generator */
export const WATERMARK_DEFAULT = defaultWatermarkHost()

/** Default list until Firestore `siteConfig/public.regulations` is set. */
export const DEFAULT_REGULATIONS: RegulationEntry[] = [
  { id: 'r18', label: 'R18' },
  { id: 'r22', label: 'R22' },
  { id: 'r24', label: 'R24' },
]

/** @deprecated Use `useRegulations()` or `fetchPublicRegulations()` for the live list. */
export const REGULATIONS = DEFAULT_REGULATIONS

export const BRANCHES = [
  { id: 'cse', label: 'CSE' },
  { id: 'ece', label: 'ECE' },
  { id: 'eee', label: 'EEE' },
  { id: 'mech', label: 'MECH' },
  { id: 'civil', label: 'CIVIL' },
  { id: 'it', label: 'IT' },
  { id: 'aiml', label: 'AI/ML' },
  { id: 'ds', label: 'DS' },
] as const

export const SEMESTERS = [
  '1-1',
  '1-2',
  '2-1',
  '2-2',
  '3-1',
  '3-2',
  '4-1',
  '4-2',
] as const

export const YEARS = ['1st', '2nd', '3rd', '4th'] as const

/** When Firestore `year` is empty, derive a label from semester (e.g. `1-2` → `1st`). */
export function inferYearLabelFromSemester(semester: string): string {
  const d = semester.trim().charAt(0)
  const map: Record<string, string> = { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th' }
  return map[d] ?? '2nd'
}

export const PROFANITY_BLOCKLIST = [
  'spam',
  'scam',
  // extend via Firestore `settings` in production
]
