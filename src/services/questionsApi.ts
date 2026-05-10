import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { SAMPLE_QUESTION_SETS } from '@/services/mock/sampleData'
import { getFirebaseDb, isFirebaseConfigured } from '@/services/firebase/config'
import type { QuestionSet, RegulationId } from '@/types/models'
import { slugify } from '@/lib/slug'

const COLLECTION = 'questionSets'

function mapDoc(id: string, data: Record<string, unknown>): QuestionSet {
  return {
    id,
    title: String(data.title ?? ''),
    slug: String(data.slug ?? ''),
    regulation: data.regulation as RegulationId,
    branch: String(data.branch ?? ''),
    year: String(data.year ?? ''),
    semester: String(data.semester ?? ''),
    subjectName: String(data.subjectName ?? ''),
    subjectCode: String(data.subjectCode ?? ''),
    unitNumber: Number(data.unitNumber ?? 0),
    questions: Array.isArray(data.questions) ? (data.questions as string[]) : [],
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : undefined,
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? ''),
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
    featured: Boolean(data.featured),
    downloadCount: Number(data.downloadCount ?? 0),
    viewCount: Number(data.viewCount ?? 0),
    shareCount: Number(data.shareCount ?? 0),
    status: (data.status as QuestionSet['status']) ?? 'published',
  }
}

function mockFindByPath(
  regulation: string,
  branch: string,
  semester: string,
  subjectSlug: string,
  unitNum: number,
): QuestionSet | null {
  const reg = regulation.toLowerCase() as RegulationId
  return (
    SAMPLE_QUESTION_SETS.find(
      (q) =>
        q.regulation === reg &&
        q.branch === branch.toLowerCase() &&
        q.semester === semester &&
        slugify(q.subjectName) === subjectSlug &&
        q.unitNumber === unitNum,
    ) ?? null
  )
}

function mockSearch(params: {
  q?: string
  regulation?: RegulationId
  branch?: string
  semester?: string
}): QuestionSet[] {
  let list = SAMPLE_QUESTION_SETS.filter((x) => x.status === 'published')
  if (params.regulation) list = list.filter((x) => x.regulation === params.regulation)
  if (params.branch) {
    const b = params.branch.toLowerCase()
    list = list.filter((x) => x.branch === b)
  }
  if (params.semester) list = list.filter((x) => x.semester === params.semester)
  if (params.q) {
    const t = params.q.toLowerCase()
    list = list.filter(
      (x) =>
        x.subjectName.toLowerCase().includes(t) ||
        x.subjectCode.toLowerCase().includes(t) ||
        x.keywords.some((k) => k.toLowerCase().includes(t)) ||
        x.title.toLowerCase().includes(t),
    )
  }
  return list
}

export async function fetchQuestionSetByRoute(params: {
  regulation: string
  branch: string
  semester: string
  subjectSlug: string
  unitNumber: number
}): Promise<QuestionSet | null> {
  if (!isFirebaseConfigured()) {
    return mockFindByPath(
      params.regulation,
      params.branch,
      params.semester,
      params.subjectSlug,
      params.unitNumber,
    )
  }

  const db = getFirebaseDb()
  const expectedSlug = `${params.subjectSlug}-unit-${params.unitNumber}-important-questions`
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('status', '==', 'published'), limit(200)),
  )
  const list = snap.docs.map((d) => mapDoc(d.id, d.data()))
  const exact =
    list.find(
      (q) =>
        q.slug === expectedSlug &&
        q.regulation === params.regulation.toLowerCase() &&
        q.branch === params.branch.toLowerCase() &&
        q.semester === params.semester,
    ) ??
    list.find(
      (q) =>
        q.regulation === params.regulation.toLowerCase() &&
        q.branch === params.branch.toLowerCase() &&
        q.semester === params.semester &&
        q.unitNumber === params.unitNumber &&
        slugify(q.subjectName) === params.subjectSlug,
    )
  return exact ?? null
}

export async function fetchFeatured(limitN = 8): Promise<QuestionSet[]> {
  if (!isFirebaseConfigured()) {
    return SAMPLE_QUESTION_SETS.filter((x) => x.featured).slice(0, limitN)
  }
  const db = getFirebaseDb()
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('status', '==', 'published'), limit(80)),
  )
  return snap.docs
    .map((d) => mapDoc(d.id, d.data()))
    .filter((x) => x.featured)
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, limitN)
}

export async function searchQuestionSets(params: {
  q?: string
  regulation?: RegulationId
  branch?: string
  semester?: string
}): Promise<QuestionSet[]> {
  if (!isFirebaseConfigured()) {
    return mockSearch(params)
  }
  const db = getFirebaseDb()
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('status', '==', 'published'), limit(120)),
  )
  let list = snap.docs.map((d) => mapDoc(d.id, d.data()))
  if (params.regulation) list = list.filter((x) => x.regulation === params.regulation)
  if (params.branch) {
    const b = params.branch.toLowerCase()
    list = list.filter((x) => x.branch === b)
  }
  if (params.semester) list = list.filter((x) => x.semester === params.semester)
  if (params.q) {
    const t = params.q.toLowerCase()
    list = list.filter(
      (x) =>
        x.subjectName.toLowerCase().includes(t) ||
        x.subjectCode.toLowerCase().includes(t) ||
        x.keywords.some((k) => k.toLowerCase().includes(t)) ||
        x.title.toLowerCase().includes(t),
    )
  }
  return list
}

export async function fetchQuestionById(id: string): Promise<QuestionSet | null> {
  if (!isFirebaseConfigured()) {
    return SAMPLE_QUESTION_SETS.find((q) => q.id === id) ?? null
  }
  const db = getFirebaseDb()
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapDoc(snap.id, snap.data() as Record<string, unknown>)
}

export async function incrementQuestionMetric(
  id: string,
  field: 'viewCount' | 'downloadCount' | 'shareCount',
): Promise<void> {
  if (!isFirebaseConfigured()) return
  const db = getFirebaseDb()
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  await updateDoc(ref, { [field]: increment(1), updatedAt: new Date().toISOString() })
}

export type AdminQuestionPatch = Partial<
  Pick<
    QuestionSet,
    | 'status'
    | 'featured'
    | 'title'
    | 'subjectName'
    | 'subjectCode'
    | 'branch'
    | 'semester'
    | 'regulation'
    | 'unitNumber'
    | 'questions'
    | 'tags'
    | 'keywords'
    | 'slug'
    | 'year'
    | 'pdfUrl'
  >
>

export function computeQuestionSlug(subjectName: string, unitNumber: number): string {
  return `${slugify(subjectName)}-unit-${unitNumber}-important-questions`
}

/** Payload for creating a new question set document. */
export type AdminNewQuestionSetInput = Omit<
  QuestionSet,
  'id' | 'slug' | 'createdAt' | 'updatedAt'
> & { id?: string }

export async function adminCreateQuestionSet(input: AdminNewQuestionSetInput): Promise<string> {
  const now = new Date().toISOString()
  const slug = computeQuestionSlug(input.subjectName, input.unitNumber)
  let id = input.id
  if (!id) {
    if (!isFirebaseConfigured()) {
      id = `local-${crypto.randomUUID()}`
    } else {
      const db = getFirebaseDb()
      id = doc(collection(db, COLLECTION)).id
    }
  }

  const docData: QuestionSet = {
    id,
    title: input.title,
    slug,
    regulation: input.regulation,
    branch: input.branch.trim().toLowerCase(),
    year: input.year,
    semester: input.semester.trim(),
    subjectName: input.subjectName.trim(),
    subjectCode: input.subjectCode.trim(),
    unitNumber: input.unitNumber,
    questions: input.questions,
    tags: input.tags,
    keywords: input.keywords,
    pdfUrl: input.pdfUrl,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    featured: input.featured,
    downloadCount: input.downloadCount,
    viewCount: input.viewCount,
    shareCount: input.shareCount,
    status: input.status,
  }

  if (!isFirebaseConfigured()) {
    SAMPLE_QUESTION_SETS.push(docData)
    return id
  }
  const db = getFirebaseDb()
  await setDoc(
    doc(db, COLLECTION, id),
    JSON.parse(JSON.stringify(docData)) as Record<string, unknown>,
  )
  return id
}

/** Replace fields on an existing question set (admin editor). */
export async function adminSaveQuestionSet(full: QuestionSet): Promise<void> {
  const slug = computeQuestionSlug(full.subjectName, full.unitNumber)
  const payload: QuestionSet = {
    ...full,
    branch: full.branch.trim().toLowerCase(),
    subjectName: full.subjectName.trim(),
    subjectCode: full.subjectCode.trim(),
    semester: full.semester.trim(),
    slug,
    updatedAt: new Date().toISOString(),
  }
  if (!isFirebaseConfigured()) {
    const row = SAMPLE_QUESTION_SETS.find((q) => q.id === full.id)
    if (row) Object.assign(row, payload)
    return
  }
  const db = getFirebaseDb()
  await setDoc(doc(db, COLLECTION, full.id), payload, { merge: true })
}

/** All statuses; requires admin Firestore rules. */
export async function adminListAllQuestionSets(maxDocs = 500): Promise<QuestionSet[]> {
  if (!isFirebaseConfigured()) {
    return [...SAMPLE_QUESTION_SETS]
  }
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, COLLECTION), limit(maxDocs)))
  return snap.docs.map((d) => mapDoc(d.id, d.data()))
}

export async function adminPatchQuestionSet(id: string, patch: AdminQuestionPatch): Promise<void> {
  const payload = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  ) as Record<string, unknown>
  if (!isFirebaseConfigured()) {
    const row = SAMPLE_QUESTION_SETS.find((q) => q.id === id)
    if (row) Object.assign(row, payload)
    return
  }
  const db = getFirebaseDb()
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...payload, updatedAt: new Date().toISOString() })
}

export async function adminDeleteQuestionSet(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const i = SAMPLE_QUESTION_SETS.findIndex((q) => q.id === id)
    if (i >= 0) SAMPLE_QUESTION_SETS.splice(i, 1)
    return
  }
  const db = getFirebaseDb()
  await deleteDoc(doc(db, COLLECTION, id))
}
