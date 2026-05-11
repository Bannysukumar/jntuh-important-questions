/** Lowercase slug in URLs (e.g. r18, r22, r25). Managed under Admin → Regulations. */
export type RegulationId = string

export interface RegulationEntry {
  id: RegulationId
  label: string
}

export type QuestionStatus = 'draft' | 'published' | 'archived'

export interface QuestionSet {
  id: string
  title: string
  slug: string
  regulation: RegulationId
  branch: string
  year: string
  semester: string
  subjectName: string
  subjectCode: string
  unitNumber: number
  questions: string[]
  tags: string[]
  keywords: string[]
  pdfUrl?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  featured: boolean
  /** Shown in “Top picks” on home when enabled. */
  important: boolean
  /** Shown in “Top picks” on home when enabled. */
  popular: boolean
  /** Listed under “Browse by branch” on home; default true when missing in Firestore. */
  showOnHome: boolean
  downloadCount: number
  viewCount: number
  shareCount: number
  status: QuestionStatus
}

export interface SubjectMeta {
  id: string
  name: string
  code: string
  branch: string
  regulation: RegulationId
  semester: string
  slug: string
}

export interface BranchDoc {
  id: string
  name: string
  code: string
}

export type UserDegree = 'btech' | 'bpharm' | 'other'

/** `admin` if `admins/{uid}` exists or `users/{uid}.role` is admin (trusted / Console). */
export type UserRole = 'student' | 'admin'

export interface UserProfile {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  role?: UserRole
  /** B. Tech, B. Pharmacy, or other programme */
  degree?: UserDegree
  /** When degree is `other`, free-text label from the student */
  degreeOther?: string | null
  rollNumber?: string | null
  favoritesSubjectIds: string[]
  favoritesQuestionIds: string[]
  createdAt: string
  updatedAt?: string
}

export interface CommentDoc {
  id: string
  questionSetId: string
  authorUid: string
  authorName: string
  body: string
  parentId: string | null
  likes: number
  dislikes: number
  likedBy: string[]
  pinned: boolean
  createdAt: string
  updatedAt: string
  edited: boolean
  status: 'visible' | 'hidden' | 'flagged'
}

export interface SiteSettings {
  siteName: string
  baseUrl: string
  watermarkText: string
}

/** Single public doc at `siteConfig/public` (optional Firestore). */
export interface AdminSiteConfig extends SiteSettings {
  metaDescription: string
  metaKeywords: string
  ogImageUrl: string
  /**
   * Branch ids (lowercase) shown in “Browse by branch” on the home page.
   * Empty array means all branches from `BRANCHES` in constants.
   */
  homeBranchIds: string[]
  /** Curriculum regulations (R18, R22, R25, …). Order = display order in filters. */
  regulations: RegulationEntry[]
}

/** Public site rating at `siteRatings/{uid}` — one doc per signed-in user. */
export interface SiteRatingDoc {
  /** Document id equals `authorUid`. */
  id: string
  authorUid: string
  authorName: string
  /** 1–5 stars. */
  stars: number
  comment: string
  createdAt: string
  updatedAt: string
}

/** Student feedback at `feedback/{id}`. Readable only by admins. */
export type FeedbackStatus = 'new' | 'read' | 'archived'

export interface FeedbackDoc {
  id: string
  message: string
  contactEmail: string | null
  authorUid: string | null
  authorName: string | null
  createdAt: string
  status: FeedbackStatus
}
