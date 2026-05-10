import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  type Timestamp,
} from 'firebase/firestore'
import type { FeedbackDoc, FeedbackStatus } from '@/types/models'
import { getFirebaseDb, isFirebaseConfigured } from '@/services/firebase/config'

const COLLECTION = 'feedback'

function mapDoc(id: string, data: Record<string, unknown>): FeedbackDoc {
  const created = data.createdAt as Timestamp | undefined
  const createdAt =
    created && typeof created.toDate === 'function' ? created.toDate().toISOString() : ''
  return {
    id,
    message: String(data.message ?? ''),
    contactEmail: data.contactEmail != null ? String(data.contactEmail) : null,
    authorUid: data.authorUid != null ? String(data.authorUid) : null,
    authorName: data.authorName != null ? String(data.authorName) : null,
    createdAt,
    status: (data.status === 'read' || data.status === 'archived' ? data.status : 'new') as FeedbackStatus,
  }
}

export async function submitFeedback(input: {
  message: string
  contactEmail?: string | null
  authorName?: string | null
  authorUid?: string | null
}): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error('Feedback is unavailable: Firebase is not configured.')
  }
  const db = getFirebaseDb()
  const trimmed = input.message.trim()
  if (trimmed.length < 10) {
    throw new Error('Please write at least a few sentences (10+ characters).')
  }

  const payload: Record<string, unknown> = {
    message: trimmed,
    status: 'new',
    createdAt: serverTimestamp(),
  }

  const email = input.contactEmail?.trim()
  if (email) payload.contactEmail = email

  const name = input.authorName?.trim()
  if (name) payload.authorName = name

  if (input.authorUid) {
    payload.authorUid = input.authorUid
  }

  await addDoc(collection(db, COLLECTION), payload)
}

export async function adminListFeedback(maxDocs = 200): Promise<FeedbackDoc[]> {
  if (!isFirebaseConfigured()) {
    return []
  }
  const db = getFirebaseDb()
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(maxDocs))
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapDoc(d.id, d.data() as Record<string, unknown>))
}

export async function adminSetFeedbackStatus(id: string, status: FeedbackStatus): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured.')
  }
  const db = getFirebaseDb()
  await updateDoc(doc(db, COLLECTION, id), { status })
}
