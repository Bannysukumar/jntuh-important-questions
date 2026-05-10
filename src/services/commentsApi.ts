import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { CommentDoc } from '@/types/models'
import { getFirebaseDb, isFirebaseConfigured } from '@/services/firebase/config'

const COLLECTION = 'comments'

const memory: CommentDoc[] = []

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

function mapComment(id: string, data: Record<string, unknown>): CommentDoc {
  return {
    id,
    questionSetId: String(data.questionSetId ?? ''),
    authorUid: String(data.authorUid ?? ''),
    authorName: String(data.authorName ?? 'Student'),
    body: String(data.body ?? ''),
    parentId: data.parentId ? String(data.parentId) : null,
    likes: Number(data.likes ?? 0),
    dislikes: Number(data.dislikes ?? 0),
    likedBy: Array.isArray(data.likedBy) ? (data.likedBy as string[]) : [],
    pinned: Boolean(data.pinned),
    createdAt: firestoreTimeToIso(data.createdAt),
    updatedAt: firestoreTimeToIso(data.updatedAt),
    edited: Boolean(data.edited),
    status: (data.status as CommentDoc['status']) ?? 'visible',
  }
}

export async function fetchCommentsForQuestion(questionSetId: string): Promise<CommentDoc[]> {
  if (!isFirebaseConfigured()) {
    return memory
      .filter((c) => c.questionSetId === questionSetId && c.status === 'visible')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }
  const db = getFirebaseDb()
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('questionSetId', '==', questionSetId), limit(200)),
  )
  return snap.docs
    .map((d) => mapComment(d.id, d.data()))
    .filter((c) => c.status === 'visible')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function assertValidReplyInMemory(input: {
  questionSetId: string
  parentId: string | null
}): void {
  if (!input.parentId) return
  const parent = memory.find((c) => c.id === input.parentId)
  if (!parent || parent.questionSetId !== input.questionSetId) {
    throw new Error('invalid-parent')
  }
  if (parent.status !== 'visible') {
    throw new Error('parent-hidden')
  }
}

export async function addComment(input: {
  questionSetId: string
  authorUid: string
  authorName: string
  body: string
  parentId: string | null
}): Promise<void> {
  if (!isFirebaseConfigured()) {
    assertValidReplyInMemory(input)
    memory.push({
      id: `local-${crypto.randomUUID()}`,
      questionSetId: input.questionSetId,
      authorUid: input.authorUid,
      authorName: input.authorName,
      body: input.body,
      parentId: input.parentId,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      edited: false,
      status: 'visible',
    })
    return
  }
  const db = getFirebaseDb()
  await addDoc(collection(db, COLLECTION), {
    questionSetId: input.questionSetId,
    authorUid: input.authorUid,
    authorName: input.authorName,
    body: input.body,
    parentId: input.parentId,
    likes: 0,
    dislikes: 0,
    likedBy: [],
    pinned: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    edited: false,
    status: 'visible',
  })
}

/** Author deletes their own comment (rules: must be owner). */
export async function deleteMyComment(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const i = memory.findIndex((c) => c.id === id)
    if (i >= 0) memory.splice(i, 1)
    return
  }
  const db = getFirebaseDb()
  await deleteDoc(doc(db, COLLECTION, id))
}

/** Deletes a comment and all descendants (deepest-first). Pass the full comment list for the app. */
export async function adminDeleteCommentCascade(id: string, allComments: CommentDoc[]): Promise<void> {
  const children = allComments.filter((c) => c.parentId === id)
  for (const ch of children) {
    await adminDeleteCommentCascade(ch.id, allComments)
  }
  await adminDeleteComment(id)
}

export async function adminFetchAllComments(limitN = 400): Promise<CommentDoc[]> {
  if (!isFirebaseConfigured()) {
    return [...memory].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  const db = getFirebaseDb()
  const snap = await getDocs(query(collection(db, COLLECTION), limit(limitN)))
  return snap.docs
    .map((d) => mapComment(d.id, d.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function adminUpdateComment(
  id: string,
  patch: Partial<Pick<CommentDoc, 'status' | 'pinned' | 'body'>>,
): Promise<void> {
  const payload = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  ) as Record<string, unknown>
  if (!isFirebaseConfigured()) {
    const row = memory.find((c) => c.id === id)
    if (row) Object.assign(row, payload, { updatedAt: new Date().toISOString() })
    return
  }
  const db = getFirebaseDb()
  await updateDoc(doc(db, COLLECTION, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export async function adminDeleteComment(id: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    const i = memory.findIndex((c) => c.id === id)
    if (i >= 0) memory.splice(i, 1)
    return
  }
  const db = getFirebaseDb()
  await deleteDoc(doc(db, COLLECTION, id))
}
