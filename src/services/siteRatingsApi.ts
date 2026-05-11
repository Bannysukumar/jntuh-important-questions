import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type { SiteRatingDoc } from '@/types/models'
import { getFirebaseDb, isFirebaseConfigured } from '@/services/firebase/config'

const COLLECTION = 'siteRatings'

const memory = new Map<string, SiteRatingDoc>()
const memorySubs = new Set<(rows: SiteRatingDoc[]) => void>()

function firestoreTimeToIso(v: unknown): string {
  if (v == null) return new Date().toISOString()
  if (typeof v === 'string') return v
  if (
    typeof v === 'object' &&
    v !== null &&
    'toDate' in v &&
    typeof (v as { toDate: () => Date }).toDate === 'function'
  ) {
    return (v as { toDate: () => Date }).toDate().toISOString()
  }
  return String(v)
}

function mapDoc(id: string, data: Record<string, unknown>): SiteRatingDoc {
  const stars = Number(data.stars ?? 0)
  return {
    id,
    authorUid: String(data.authorUid ?? id),
    authorName: String(data.authorName ?? 'Student'),
    stars: Number.isFinite(stars) ? Math.min(5, Math.max(1, Math.round(stars))) : 3,
    comment: String(data.comment ?? ''),
    createdAt: firestoreTimeToIso(data.createdAt),
    updatedAt: firestoreTimeToIso(data.updatedAt),
  }
}

function notifyMemory(): void {
  const rows = [...memory.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  for (const cb of memorySubs) cb(rows)
}

/** Live updates when Firestore is configured; in-memory when not. */
export function subscribeSiteRatings(onRows: (rows: SiteRatingDoc[]) => void): () => void {
  if (!isFirebaseConfigured()) {
    memorySubs.add(onRows)
    onRows([...memory.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    return () => {
      memorySubs.delete(onRows)
    }
  }
  const db = getFirebaseDb()
  return onSnapshot(collection(db, COLLECTION), (snap) => {
    const rows = snap.docs.map((d) => mapDoc(d.id, d.data()))
    rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    onRows(rows)
  })
}

export async function upsertSiteRating(input: {
  uid: string
  authorName: string
  stars: number
  comment: string
  /** When null, `createdAt` is set on write. */
  existing: SiteRatingDoc | null
}): Promise<void> {
  const stars = Math.min(5, Math.max(1, Math.round(Number(input.stars))))
  const comment = input.comment.trim().slice(0, 2000)
  const authorName = input.authorName.trim().slice(0, 120) || 'Student'

  if (!isFirebaseConfigured()) {
    const now = new Date().toISOString()
    const prev = memory.get(input.uid)
    const row: SiteRatingDoc = {
      id: input.uid,
      authorUid: input.uid,
      authorName,
      stars,
      comment,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    }
    memory.set(input.uid, row)
    notifyMemory()
    return
  }

  const db = getFirebaseDb()
  const ref = doc(db, COLLECTION, input.uid)
  await setDoc(
    ref,
    {
      authorUid: input.uid,
      authorName,
      stars,
      comment,
      updatedAt: serverTimestamp(),
      ...(input.existing ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  )
}

export async function deleteSiteRating(uid: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    memory.delete(uid)
    notifyMemory()
    return
  }
  const db = getFirebaseDb()
  await deleteDoc(doc(db, COLLECTION, uid))
}
