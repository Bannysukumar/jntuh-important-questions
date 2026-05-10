import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { SITE_NAME } from '@/lib/constants'
import { getFirebaseDb, isFirebaseConfigured } from '@/services/firebase/config'
import { adminFetchAllComments } from '@/services/commentsApi'
import {
  adminDeleteQuestionSet,
  adminListAllQuestionSets,
  adminSaveQuestionSet,
} from '@/services/questionsApi'
import type { AdminSiteConfig, QuestionSet, RegulationId, UserDegree, UserProfile, UserRole } from '@/types/models'

const USERS = 'users'
const SITE_CONFIG = 'siteConfig'
const SITE_DOC = 'public'
const LS_KEY = 'jntuh-admin-site-config-v1'

export const defaultAdminSiteConfig = (): AdminSiteConfig => ({
  siteName: SITE_NAME,
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  watermarkText: 'JNTUH Important Questions',
  metaDescription:
    'JNTUH unit-wise important questions — search by regulation, branch, and semester. PDFs and study resources.',
  metaKeywords: 'JNTUH, important questions, R18, R22, R24, engineering',
  ogImageUrl: '',
})

function readLocalConfig(): AdminSiteConfig {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return defaultAdminSiteConfig()
    const parsed = JSON.parse(raw) as Partial<AdminSiteConfig>
    return { ...defaultAdminSiteConfig(), ...parsed }
  } catch {
    return defaultAdminSiteConfig()
  }
}

function writeLocalConfig(c: AdminSiteConfig) {
  localStorage.setItem(LS_KEY, JSON.stringify(c))
}

export async function fetchAdminSiteConfig(): Promise<AdminSiteConfig> {
  if (!isFirebaseConfigured()) {
    return readLocalConfig()
  }
  try {
    const db = getFirebaseDb()
    const snap = await getDoc(doc(db, SITE_CONFIG, SITE_DOC))
    if (!snap.exists()) {
      const initial = defaultAdminSiteConfig()
      writeLocalConfig(initial)
      return initial
    }
    const d = snap.data() as Record<string, unknown>
    return {
      ...defaultAdminSiteConfig(),
      siteName: String(d.siteName ?? SITE_NAME),
      baseUrl: String(d.baseUrl ?? ''),
      watermarkText: String(d.watermarkText ?? ''),
      metaDescription: String(d.metaDescription ?? ''),
      metaKeywords: String(d.metaKeywords ?? ''),
      ogImageUrl: String(d.ogImageUrl ?? ''),
    }
  } catch {
    return readLocalConfig()
  }
}

export async function saveAdminSiteConfig(config: AdminSiteConfig): Promise<void> {
  const payload = {
    ...config,
    updatedAt: new Date().toISOString(),
  }
  if (!isFirebaseConfigured()) {
    writeLocalConfig(config)
    return
  }
  const db = getFirebaseDb()
  await setDoc(doc(db, SITE_CONFIG, SITE_DOC), payload, { merge: true })
  writeLocalConfig(config)
}

export interface AdminUserRow {
  id: string
  email: string | null
  displayName: string | null
  role: string | null
  createdAt: string | null
  rollNumber?: string | null
  degree?: string | null
}

const mockUserStore: AdminUserRow[] = [
  {
    id: 'demo-user',
    email: 'demo@university.edu',
    displayName: 'Demo student',
    role: 'student',
    createdAt: new Date().toISOString(),
  },
]

export async function adminListUsers(maxDocs = 300): Promise<AdminUserRow[]> {
  if (!isFirebaseConfigured()) {
    return mockUserStore.map((u) => ({ ...u }))
  }
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, USERS), limit(maxDocs)))
  return snap.docs.map((d) => {
    const u = d.data() as UserProfile & Record<string, unknown>
    return {
      id: d.id,
      email: u.email ?? null,
      displayName: u.displayName ?? null,
      role: typeof u.role === 'string' ? u.role : null,
      createdAt: typeof u.createdAt === 'string' ? u.createdAt : null,
      rollNumber: typeof u.rollNumber === 'string' ? u.rollNumber : null,
      degree: typeof u.degree === 'string' ? u.degree : null,
    }
  })
}

export async function adminFetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) {
    const row = mockUserStore.find((u) => u.id === uid)
    if (!row) return null
    return {
      uid: row.id,
      email: row.email,
      displayName: row.displayName,
      photoURL: null,
      role: (row.role as UserRole) ?? 'student',
      rollNumber: row.rollNumber ?? null,
      degree: (row.degree as UserDegree) ?? 'btech',
      degreeOther: null,
      favoritesSubjectIds: [],
      favoritesQuestionIds: [],
      createdAt: row.createdAt ?? new Date().toISOString(),
    }
  }
  const db = getFirebaseDb()
  const snap = await getDoc(doc(db, USERS, uid))
  if (!snap.exists()) return null
  const d = snap.data() as Record<string, unknown>
  return {
    uid,
    displayName: (d.displayName as string) ?? null,
    email: (d.email as string) ?? null,
    photoURL: (d.photoURL as string) ?? null,
    role: d.role as UserProfile['role'],
    degree: d.degree as UserDegree | undefined,
    degreeOther: (d.degreeOther as string) ?? null,
    rollNumber: (d.rollNumber as string) ?? null,
    favoritesSubjectIds: Array.isArray(d.favoritesSubjectIds)
      ? (d.favoritesSubjectIds as string[])
      : [],
    favoritesQuestionIds: Array.isArray(d.favoritesQuestionIds)
      ? (d.favoritesQuestionIds as string[])
      : [],
    createdAt: String(d.createdAt ?? ''),
    updatedAt: d.updatedAt ? String(d.updatedAt) : undefined,
  }
}

export async function adminUpdateUserProfile(
  uid: string,
  patch: Partial<{
    displayName: string
    rollNumber: string | null
    degree: UserDegree
    degreeOther: string | null
    role: UserRole
  }>,
): Promise<void> {
  const payload = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  ) as Record<string, unknown>
  if (!isFirebaseConfigured()) {
    const row = mockUserStore.find((u) => u.id === uid)
    if (row) {
      if (typeof patch.displayName === 'string') row.displayName = patch.displayName
      if (patch.role) row.role = patch.role
      if (patch.rollNumber !== undefined) row.rollNumber = patch.rollNumber
      if (patch.degree) row.degree = patch.degree
    }
    return
  }
  const db = getFirebaseDb()
  await updateDoc(doc(db, USERS, uid), {
    ...payload,
    updatedAt: new Date().toISOString(),
  })
}

export async function adminDeleteUserProfile(uid: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const i = mockUserStore.findIndex((u) => u.id === uid)
    if (i >= 0) mockUserStore.splice(i, 1)
    return
  }
  const db = getFirebaseDb()
  await deleteDoc(doc(db, USERS, uid))
}

export interface AdminDashboardStats {
  totalQuestionSets: number
  published: number
  draft: number
  archived: number
  totalViews: number
  totalDownloads: number
  totalShares: number
  featuredCount: number
  topByViews: QuestionSet[]
  totalComments: number
  totalUsers: number
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [sets, comments, users] = await Promise.all([
    adminListAllQuestionSets(),
    adminFetchAllComments(500),
    adminListUsers(),
  ])

  const published = sets.filter((s) => s.status === 'published').length
  const draft = sets.filter((s) => s.status === 'draft').length
  const archived = sets.filter((s) => s.status === 'archived').length
  const totalViews = sets.reduce((a, s) => a + s.viewCount, 0)
  const totalDownloads = sets.reduce((a, s) => a + s.downloadCount, 0)
  const totalShares = sets.reduce((a, s) => a + s.shareCount, 0)
  const featuredCount = sets.filter((s) => s.featured).length
  const topByViews = [...sets].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)

  return {
    totalQuestionSets: sets.length,
    published,
    draft,
    archived,
    totalViews,
    totalDownloads,
    totalShares,
    featuredCount,
    topByViews,
    totalComments: comments.length,
    totalUsers: users.length,
  }
}

export interface SubjectAggregateRow {
  key: string
  subjectName: string
  subjectCode: string
  regulation: string
  branch: string
  semester: string
  unitCount: number
}

export async function fetchSubjectAggregates(): Promise<SubjectAggregateRow[]> {
  const sets = await adminListAllQuestionSets()
  const map = new Map<string, SubjectAggregateRow>()
  for (const q of sets) {
    const key = `${q.regulation}|${q.branch}|${q.semester}|${q.subjectCode.toLowerCase()}`
    const cur = map.get(key)
    if (cur) {
      cur.unitCount += 1
    } else {
      map.set(key, {
        key,
        subjectName: q.subjectName,
        subjectCode: q.subjectCode,
        regulation: q.regulation,
        branch: q.branch,
        semester: q.semester,
        unitCount: 1,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.subjectName.localeCompare(b.subjectName))
}

export interface BranchAggregateRow {
  regulation: string
  branch: string
  questionSetCount: number
  subjectKeys: number
}

export async function fetchBranchAggregates(): Promise<BranchAggregateRow[]> {
  const sets = await adminListAllQuestionSets()
  const map = new Map<string, { regulation: string; branch: string; sets: Set<string>; subjects: Set<string> }>()
  for (const q of sets) {
    const key = `${q.regulation}|${q.branch}`
    let cur = map.get(key)
    if (!cur) {
      cur = { regulation: q.regulation, branch: q.branch, sets: new Set(), subjects: new Set() }
      map.set(key, cur)
    }
    cur.sets.add(q.id)
    cur.subjects.add(`${q.semester}|${q.subjectCode}`)
  }
  return [...map.values()]
    .map((v) => ({
      regulation: v.regulation,
      branch: v.branch,
      questionSetCount: v.sets.size,
      subjectKeys: v.subjects.size,
    }))
    .sort((a, b) => a.regulation.localeCompare(b.regulation) || a.branch.localeCompare(b.branch))
}

export async function adminBulkPatchBySubjectRow(
  row: SubjectAggregateRow,
  patch: {
    subjectName?: string
    subjectCode?: string
    semester?: string
    branch?: string
    regulation?: RegulationId
  },
): Promise<number> {
  const sets = await adminListAllQuestionSets()
  let n = 0
  for (const q of sets) {
    if (
      q.regulation === row.regulation &&
      q.branch.toLowerCase() === row.branch.toLowerCase() &&
      q.semester === row.semester &&
      q.subjectCode.toLowerCase() === row.subjectCode.toLowerCase()
    ) {
      const merged: QuestionSet = {
        ...q,
        subjectName: patch.subjectName ?? q.subjectName,
        subjectCode: patch.subjectCode ?? q.subjectCode,
        semester: patch.semester ?? q.semester,
        branch: (patch.branch ?? q.branch).toLowerCase(),
        regulation: patch.regulation ?? q.regulation,
      }
      await adminSaveQuestionSet(merged)
      n++
    }
  }
  return n
}

export async function adminBulkDeleteBySubjectRow(row: SubjectAggregateRow): Promise<number> {
  const sets = await adminListAllQuestionSets()
  const targets = sets.filter(
    (q) =>
      q.regulation === row.regulation &&
      q.branch.toLowerCase() === row.branch.toLowerCase() &&
      q.semester === row.semester &&
      q.subjectCode.toLowerCase() === row.subjectCode.toLowerCase(),
  )
  for (const q of targets) {
    await adminDeleteQuestionSet(q.id)
  }
  return targets.length
}

export async function adminBulkPatchByBranchRow(
  row: BranchAggregateRow,
  patch: { branch?: string; regulation?: RegulationId },
): Promise<number> {
  const sets = await adminListAllQuestionSets()
  let n = 0
  for (const q of sets) {
    if (q.regulation === row.regulation && q.branch.toLowerCase() === row.branch.toLowerCase()) {
      const merged: QuestionSet = {
        ...q,
        branch: (patch.branch ?? q.branch).toLowerCase(),
        regulation: patch.regulation ?? q.regulation,
      }
      await adminSaveQuestionSet(merged)
      n++
    }
  }
  return n
}

export async function adminBulkDeleteByBranchRow(row: BranchAggregateRow): Promise<number> {
  const sets = await adminListAllQuestionSets()
  const targets = sets.filter(
    (q) =>
      q.regulation === row.regulation && q.branch.toLowerCase() === row.branch.toLowerCase(),
  )
  for (const q of targets) {
    await adminDeleteQuestionSet(q.id)
  }
  return targets.length
}
