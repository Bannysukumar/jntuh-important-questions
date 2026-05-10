const KEY_Q = 'jiq-fav-questions'

export function getLocalFavoriteQuestionIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY_Q)
    if (!raw) return []
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? (v as string[]) : []
  } catch {
    return []
  }
}

export function toggleLocalFavoriteQuestion(id: string): boolean {
  const cur = getLocalFavoriteQuestionIds()
  const has = cur.includes(id)
  const next = has ? cur.filter((x) => x !== id) : [...cur, id]
  localStorage.setItem(KEY_Q, JSON.stringify(next))
  return !has
}

export function isLocalFavoriteQuestion(id: string): boolean {
  return getLocalFavoriteQuestionIds().includes(id)
}
