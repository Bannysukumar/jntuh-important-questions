/**
 * Vercel Serverless Function — serves XML at /api/sitemap.
 * vercel.json rewrites /sitemap.xml → /api/sitemap so crawlers use the canonical path.
 */
const DEFAULT_SITE = 'https://jntuh-important-questions.vercel.app'

const PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/search', changefreq: 'daily', priority: '0.95' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/help', changefreq: 'monthly', priority: '0.55' },
  { path: '/favorites', changefreq: 'weekly', priority: '0.45' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.35' },
  { path: '/terms', changefreq: 'yearly', priority: '0.35' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.35' },
]

function siteUrl() {
  const raw =
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    DEFAULT_SITE
  return String(raw).replace(/\/$/, '')
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildXml(base) {
  const entries = PATHS.map(({ path: p, changefreq, priority }) => {
    const loc = escapeXml(p === '/' ? `${base}/` : `${base}${p}`)
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

export default function handler(_req, res) {
  const xml = buildXml(siteUrl())
  res.setHeader('Content-Type', 'text/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(xml)
}
