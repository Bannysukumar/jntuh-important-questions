/**
 * Writes UTF-8 sitemaps (no BOM) and robots.txt before Vite copies `public/` to `dist/`.
 * Set VITE_SITE_URL for production canonical origin (e.g. https://yourdomain.com).
 *
 * Sharding (optional, for large sites):
 *   SITEMAP_UNIT_CHUNK_SIZE   — URLs per sitemap-units-part-NNNN.xml (default 300)
 *   SITEMAP_FACET_CHUNK_SIZE  — URLs per sitemap-facets-part-NNNN.xml (default 400)
 *
 * Data sources for units (merged, de-duplicated):
 *   scripts/sitemap-unit-urls.txt            — manual (optional, gitignored)
 *   scripts/sitemap-unit-urls.generated.txt  — from `npm run sitemap:firestore`
 *
 * Facet “index” URLs (search hub links), optional:
 *   scripts/sitemap-facet-urls.generated.json — from `npm run sitemap:firestore`
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

const UNIT_CHUNK = Math.max(1, Number.parseInt(process.env.SITEMAP_UNIT_CHUNK_SIZE || '300', 10) || 300)
const FACET_CHUNK = Math.max(1, Number.parseInt(process.env.SITEMAP_FACET_CHUNK_SIZE || '400', 10) || 400)

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

function readPathLines(filePath) {
  if (!fs.existsSync(filePath)) return []
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter((l) => l.startsWith('/'))
}

function readGeneratedFacetPaths() {
  const j = path.join(scriptsDir, 'sitemap-facet-urls.generated.json')
  if (!fs.existsSync(j)) return []
  try {
    const data = JSON.parse(fs.readFileSync(j, 'utf8'))
    const arr = Array.isArray(data.paths) ? data.paths : []
    return arr.filter((p) => typeof p === 'string' && p.startsWith('/search?'))
  } catch {
    return []
  }
}

function removePublicGlob(baseNamePrefix) {
  if (!fs.existsSync(publicDir)) return
  for (const name of fs.readdirSync(publicDir)) {
    if (name.startsWith(baseNamePrefix) && name.endsWith('.xml')) {
      try {
        fs.unlinkSync(path.join(publicDir, name))
      } catch {
        /* ignore */
      }
    }
  }
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

// --- Unit URLs: manual + Firestore-generated ---
const manualUnits = readPathLines(path.join(scriptsDir, 'sitemap-unit-urls.txt'))
const generatedUnits = readPathLines(path.join(scriptsDir, 'sitemap-unit-urls.generated.txt'))
const unitPathList = [...new Set([...manualUnits, ...generatedUnits])].sort()

removePublicGlob('sitemap-units-part-')
try {
  fs.unlinkSync(path.join(publicDir, 'sitemap-units.xml'))
} catch {
  /* none */
}

const unitIndexLocs = []
if (unitPathList.length > 0) {
  const numParts = Math.ceil(unitPathList.length / UNIT_CHUNK)
  if (numParts === 1) {
    const entries = unitPathList.map((p) => urlEntry(`${ORIGIN}${p}`, 'weekly', '0.85'))
    fs.writeFileSync(path.join(publicDir, 'sitemap-units.xml'), urlset(entries), { encoding: 'utf8' })
    unitIndexLocs.push({ loc: `${ORIGIN}/sitemap-units.xml`, lastmod: TODAY })
  } else {
    let part = 0
    for (let i = 0; i < unitPathList.length; i += UNIT_CHUNK) {
      part += 1
      const chunk = unitPathList.slice(i, i + UNIT_CHUNK)
      const entries = chunk.map((p) => urlEntry(`${ORIGIN}${p}`, 'weekly', '0.85'))
      const name = `sitemap-units-part-${String(part).padStart(4, '0')}.xml`
      fs.writeFileSync(path.join(publicDir, name), urlset(entries), { encoding: 'utf8' })
      unitIndexLocs.push({ loc: `${ORIGIN}/${name}`, lastmod: TODAY })
    }
  }
}

// --- Facet “index” URLs (search filters from Firestore export) ---
removePublicGlob('sitemap-facets-part-')
try {
  fs.unlinkSync(path.join(publicDir, 'sitemap-facets.xml'))
} catch {
  /* none */
}
const facetPathList = [...new Set(readGeneratedFacetPaths())].sort()
const facetIndexLocs = []
if (facetPathList.length > 0) {
  const numFacetParts = Math.ceil(facetPathList.length / FACET_CHUNK)
  if (numFacetParts === 1) {
    const entries = facetPathList.map((p) => urlEntry(`${ORIGIN}${p}`, 'weekly', '0.55'))
    fs.writeFileSync(path.join(publicDir, 'sitemap-facets.xml'), urlset(entries), { encoding: 'utf8' })
    facetIndexLocs.push({ loc: `${ORIGIN}/sitemap-facets.xml`, lastmod: TODAY })
  } else {
    let part = 0
    for (let i = 0; i < facetPathList.length; i += FACET_CHUNK) {
      part += 1
      const chunk = facetPathList.slice(i, i + FACET_CHUNK)
      const entries = chunk.map((p) => urlEntry(`${ORIGIN}${p}`, 'weekly', '0.55'))
      const name = `sitemap-facets-part-${String(part).padStart(4, '0')}.xml`
      fs.writeFileSync(path.join(publicDir, name), urlset(entries), { encoding: 'utf8' })
      facetIndexLocs.push({ loc: `${ORIGIN}/${name}`, lastmod: TODAY })
    }
  }
}

// --- sitemap index (also served as /sitemap.xml) ---
const indexParts = [
  { loc: `${ORIGIN}/sitemap-static.xml`, lastmod: TODAY },
  { loc: `${ORIGIN}/sitemap-subjects.xml`, lastmod: TODAY },
  { loc: `${ORIGIN}/sitemap-blog.xml`, lastmod: TODAY },
  ...unitIndexLocs,
  ...facetIndexLocs,
]

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
  ...unitIndexLocs.map((x) => x.loc.replace(ORIGIN + '/', '')),
  ...facetIndexLocs.map((x) => x.loc.replace(ORIGIN + '/', '')),
  'robots.txt',
]
console.log('[build-sitemaps] Wrote', wrote.length, 'artifacts for', ORIGIN)
console.log(
  '[build-sitemaps] Unit parts:',
  unitIndexLocs.length,
  '(chunk',
  UNIT_CHUNK,
  ') · Facet index parts:',
  facetIndexLocs.length,
  '(chunk',
  FACET_CHUNK,
  ')',
)
