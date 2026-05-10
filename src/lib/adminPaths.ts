import { slugify, unitSegment } from '@/lib/slug'
import type { QuestionSet } from '@/types/models'

/** Public URL path for a question set (matches `router.tsx`). */
export function questionSetPublicPath(q: QuestionSet): string {
  return `/${q.regulation}/${q.branch}/${q.semester}/${slugify(q.subjectName)}/${unitSegment(q.unitNumber)}`
}
