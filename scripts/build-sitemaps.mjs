/**
 * Writes UTF-8 sitemaps (no BOM) and robots.txt before Vite copies `public/` to `dist/`.
 * Set VITE_SITE_URL for production canonical origin (e.g. https://yourdomain.com).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const scriptsDir = path.join(root, 'scripts')

const ORIGIN = (process.env.VITE_SITE_URL || 'https://jntuh-iq.vercel.app').replace(/\/$/, '')
const TODAY = new Date().toISOString().slice(0, 10)

/** Slugs parsed from `src/lib/blogPosts.ts` (each post `slug: '…'`). */
function readBlogSlugs() {
  const blogTs = path.join(root, 'src/lib/blogPosts.ts')
  if (!fs.existsSync(blogTs)) return []
  const txt = fs.readFileSync(blogTs, 'utf8')
  const out = []
  const re = /slug:\s*['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(txt)) !== null) out.push(m[1])
  return [...new Set(out)]
}

const BLOG_SLUGS = readBlogSlugs()

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function urlEntry(loc, changefreq, priority) {
  return `  <url>\n    <loc>${esc(loc)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

function urlset(entries) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`
  )
}

function sitemapIndex(parts) {
  const items = parts
    .map(
      (p) =>
        `  <sitemap>\n    <loc>${esc(p.loc)}</loc>\n    <lastmod>${p.lastmod}</lastmod>\n  </sitemap>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`
}

// --- sitemap-static.xml (no /search — lives in subjects hub) ---
const staticEntries = [
  urlEntry(`${ORIGIN}/`, 'daily', '1.0'),
  urlEntry(`${ORIGIN}/about`, 'monthly', '0.75'),
  urlEntry(`${ORIGIN}/ratings`, 'weekly', '0.65'),
  urlEntry(`${ORIGIN}/help`, 'monthly', '0.6'),
  urlEntry(`${ORIGIN}/favorites`, 'weekly', '0.45'),
  urlEntry(`${ORIGIN}/privacy`, 'yearly', '0.35'),
  urlEntry(`${ORIGIN}/terms`, 'yearly', '0.35'),
  urlEntry(`${ORIGIN}/disclaimer`, 'yearly', '0.35'),
]
fs.writeFileSync(path.join(publicDir, 'sitemap-static.xml'), urlset(staticEntries), { encoding: 'utf8' })

// --- sitemap-subjects.xml (search + discovery hub) ---
const subjectEntries = [urlEntry(`${ORIGIN}/search`, 'daily', '0.95')]
fs.writeFileSync(path.join(publicDir, 'sitemap-subjects.xml'), urlset(subjectEntries), { encoding: 'utf8' })

// --- sitemap-blog.xml (hub + posts; hub not duplicated in sitemap-static) ---
const blogEntries = [
  urlEntry(`${ORIGIN}/blog`, 'weekly', '0.72'),
  ...BLOG_SLUGS.map((slug) => urlEntry(`${ORIGIN}/blog/${slug}`, 'weekly', '0.68')),
]
fs.writeFileSync(path.join(publicDir, 'sitemap-blog.xml'), urlset(blogEntries), { encoding: 'utf8' })

// --- sitemap-units.xml (optional: one path per line, must start with /) ---
const unitListPath = path.join(scriptsDir, 'sitemap-unit-urls.txt')
let unitEntries = []
if (fs.existsSync(unitListPath)) {
  const raw = fs.readFileSync(unitListPath, 'utf8')
  unitEntries = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('/'))
    .map((p) => urlEntry(`${ORIGIN}${p}`, 'weekly', '0.85'))
}

const unitsPath = path.join(publicDir, 'sitemap-units.xml')
if (unitEntries.length > 0) {
  fs.writeFileSync(unitsPath, urlset(unitEntries), { encoding: 'utf8' })
} else {
  try {
    fs.unlinkSync(unitsPath)
  } catch {
    /* no previous file */
  }
}

// --- sitemap index (also served as /sitemap.xml) ---
const indexParts = [
  { loc: `${ORIGIN}/sitemap-static.xml`, lastmod: TODAY },
  { loc: `${ORIGIN}/sitemap-subjects.xml`, lastmod: TODAY },
  { loc: `${ORIGIN}/sitemap-blog.xml`, lastmod: TODAY },
]
if (unitEntries.length > 0) {
  indexParts.push({ loc: `${ORIGIN}/sitemap-units.xml`, lastmod: TODAY })
}
const indexXml = sitemapIndex(indexParts)
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), indexXml, { encoding: 'utf8' })

// --- robots.txt ---
const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Private / auth surfaces
Disallow: /admin
Disallow: /login
Disallow: /profile

Sitemap: ${ORIGIN}/sitemap.xml
`
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, { encoding: 'utf8' })

const wrote = [
  'sitemap.xml (index)',
  'sitemap-static.xml',
  'sitemap-subjects.xml',
  'sitemap-blog.xml',
  ...(unitEntries.length > 0 ? ['sitemap-units.xml'] : []),
  'robots.txt',
]
console.log('[build-sitemaps] Wrote', wrote.join(', '), 'for', ORIGIN)
