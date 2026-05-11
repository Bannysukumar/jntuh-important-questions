import { SITE_NAME } from '@/lib/constants'

/** Primary meta description — aligned with About Us mission (SEO + consistency). */
export const META_DESCRIPTION_DEFAULT =
  "Free JNTUH important questions prepared by analyzing previous years' Regular and Supplementary exams. Unit-wise PDFs with up to 96% historical accuracy and continuous updates before every exam."

/** Footer line under legal links. */
export const FOOTER_TAGLINE =
  'Study smart. Prepare with confidence. Pass your exams successfully.'

export const HOME_HERO_HEADLINE =
  'JNTUH important questions prepared through 3 years of proven analysis'

export const HOME_HERO_SUB =
  "Free unit-wise important questions created by analyzing previous years' Regular and Supplementary exam papers across all regulations (R18, R22, and future regulations), with up to 96% historical accuracy."

export const HOME_CTA_PRIMARY_LABEL = 'Start preparing free'
export const HOME_CTA_SECONDARY_LABEL = 'Explore important questions'

export const TRUST_BADGES: readonly string[] = [
  'Up to 96% historical accuracy',
  '100% free for all students',
  'Updated until 2 hours before exams',
  'Tested over 3 years',
]

export const SEARCH_PAGE_INTRO =
  "Search unit-wise important questions prepared from previous years' question paper analysis and exam trend prediction."

export const HOME_VALUE_SECTION_TITLE = 'Why students trust this platform'

export const HOME_VALUE_SECTION_BODY = `${SITE_NAME} is a free educational resource for JNTUH Hyderabad B.Tech students. Important questions are built from previous years' papers (Regular and Supplementary), repeated-question patterns, and likely-exam predictions — organized unit-wise so you prepare faster. Content is updated from about three months before exams through to the last hours before your paper.`

export function unitPageMetaDescription(input: {
  regulation: string
  branch: string
  semester: string
  subjectName: string
  subjectCode: string
  unitNumber: number
}): string {
  const r = input.regulation.toUpperCase()
  const b = input.branch.toUpperCase()
  return (
    `Free JNTUH ${r} ${b} — ${input.subjectName} (${input.subjectCode}) Unit ${input.unitNumber}: ` +
    `important questions from previous Regular & Supplementary paper analysis, unit-wise, up to 96% historical accuracy, ` +
    `PDF download, semester ${input.semester}.`
  )
}

export const UNIT_PAGE_INTRO =
  'Study the most important and frequently repeated questions for this unit, organized to help you focus on what matters most in the exam — from analysis-backed prediction, not guesswork alone.'

export const PDF_DOWNLOAD_DESCRIPTION =
  'Download a watermark-protected PDF containing unit-wise important questions generated through detailed analysis and prediction.'

export const COMMENTS_SECTION_INTRO =
  'Join the discussion and help fellow students by sharing your preparation tips and exam experiences.'

export const RATINGS_SEO_DESCRIPTION =
  'Share your exam experience and rate how many questions matched from our predictions. Your feedback helps other students and improves future analysis.'

export const RATINGS_PRIMARY_CTA = 'Submit your live rating'
export const RATINGS_UPDATE_CTA = 'Update your live rating'

export const OG_IMAGE_ALT =
  'Free JNTUH important questions — previous years analysis, unit-wise PDFs, up to 96% historical accuracy, updates before exams'

export const JSON_LD_ORGANIZATION_DESCRIPTION = META_DESCRIPTION_DEFAULT

/** Sidebar footer under navigation. */
export const SITE_SIDEBAR_TAGLINE =
  'Free JNTUH B.Tech important questions from previous-paper analysis — unit-wise PDFs, up to 96% historical accuracy, updates before exams.'

export const FAVORITES_SEO_DESCRIPTION = `Saved unit-wise JNTUH important questions — free revision lists from previous-paper analysis. ${SITE_NAME}.`

export const PROFILE_SEO_DESCRIPTION = `Your ${SITE_NAME} profile — free JNTUH B.Tech exam prep, ratings after exams, and account settings.`

export const HELP_SEO_DESCRIPTION = `Help for ${SITE_NAME}: FAQs on free unit-wise important questions, PDFs, search, ratings after exams, and feedback.`
