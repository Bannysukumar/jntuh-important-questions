import { PROFANITY_BLOCKLIST } from '@/lib/constants'

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return PROFANITY_BLOCKLIST.some((w) => lower.includes(w))
}

export function scoreSpamHeuristic(text: string): number {
  let score = 0
  if (text.length < 3) score += 2
  if (/(.)\1{6,}/.test(text)) score += 2
  if (/(https?:\/\/){2,}/i.test(text)) score += 3
  if ((text.match(/https?:\/\//gi) ?? []).length > 2) score += 2
  return score
}

export function shouldBlockComment(text: string): boolean {
  if (containsProfanity(text)) return true
  return scoreSpamHeuristic(text) >= 4
}
