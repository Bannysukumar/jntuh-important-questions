import { BRANCHES } from '@/lib/constants'

const ALL_IDS = BRANCHES.map((b) => b.id)

/** Branches to show on home: empty config means all known branches. */
export function effectiveHomeBranchIds(homeBranchIds: string[] | undefined): string[] {
  const raw = homeBranchIds ?? []
  if (raw.length === 0) return [...ALL_IDS]
  return ALL_IDS.filter((id) => raw.includes(id))
}
