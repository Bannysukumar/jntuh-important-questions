export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseUnitFromSegment(segment: string): number | null {
  const m = /^unit-(\d+)-important-questions$/.exec(segment)
  if (!m) return null
  return Number.parseInt(m[1]!, 10)
}

export function unitSegment(unitNumber: number): string {
  return `unit-${unitNumber}-important-questions`
}
