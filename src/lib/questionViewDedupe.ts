/** One view count per question-set per browser (survives refresh; clears if storage cleared). */
const KEY_PREFIX = 'jiq-view-v1:'

/** Reserve this view synchronously so repeat visits / StrictMode double effects do not inflate counts. */
export function reserveQuestionViewSlot(questionSetId: string): boolean {
  if (typeof window === 'undefined') return true
  try {
    const key = KEY_PREFIX + questionSetId
    if (window.localStorage.getItem(key) != null) return false
    window.localStorage.setItem(key, '1')
    return true
  } catch {
    return true
  }
}

export function releaseQuestionViewSlot(questionSetId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY_PREFIX + questionSetId)
  } catch {
    /* ignore */
  }
}
