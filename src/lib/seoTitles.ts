import { SITE_NAME } from '@/lib/constants'

/**
 * Bing warns when `<title>` (and equivalents) exceeds ~70 characters.
 * Stay well under so crawlers counting bytes/graphemes do not flag warnings.
 */
export const SEO_DOCUMENT_TITLE_MAX_LENGTH = 59

/** Full title including site brand when absent (matches `SEOHead` rules). */
export function joinTitleWithSiteName(pageTitle: string): string {
  const t = pageTitle.trim().replace(/\s+/g, ' ')
  if (!t) return SITE_NAME
  return t.toLowerCase().includes(SITE_NAME.toLowerCase()) ? t : `${t} | ${SITE_NAME}`
}

/** Use for `<title>`, og:title, twitter:title, JSON-LD `headline` / `name` on pages. */
export function formatDocumentTitle(pageTitle: string, maxLen = SEO_DOCUMENT_TITLE_MAX_LENGTH): string {
  return clampDocumentTitle(joinTitleWithSiteName(pageTitle), maxLen)
}

export function clampDocumentTitle(fullTitle: string, max = SEO_DOCUMENT_TITLE_MAX_LENGTH): string {
  const t = fullTitle.trim().replace(/\s+/g, ' ')
  if (t.length <= max) return t
  const slicePart = t.slice(0, max - 1).trimEnd()
  const cut = slicePart.lastIndexOf(' ')
  const base = cut > Math.floor(max * 0.45) ? slicePart.slice(0, cut).trimEnd() : slicePart
  return `${base}…`
}
