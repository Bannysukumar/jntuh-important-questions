/**
 * Canonical site origin for SEO, JSON-LD, canonical tags, and OG URLs.
 * Set `VITE_SITE_URL` in production (e.g. https://jntuh-important-questions.vercel.app).
 */
export function getSiteUrl(): string {
  const v = import.meta.env.VITE_SITE_URL
  if (typeof v === 'string' && v.trim()) return v.trim().replace(/\/$/, '')
  return 'https://jntuh-important-questions.vercel.app'
}

export const SITE_URL = getSiteUrl()

export function siteHostname(): string {
  try {
    return new URL(SITE_URL).hostname.replace(/^www\./, '')
  } catch {
    return 'jntuh-important-questions.vercel.app'
  }
}

/** Default PDF watermark host — matches public site hostname */
export function defaultWatermarkHost(): string {
  return siteHostname()
}
