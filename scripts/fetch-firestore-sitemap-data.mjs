/**
 * Reads all `questionSets` from Firestore (Admin SDK) and writes URL lists for sitemap generation.
 *
 * Setup (do NOT commit service account JSON):
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
 *   npm run sitemap:firestore
 *
 * Or one-shot:
 *   set FIREBASE_SERVICE_ACCOUNT_PATH=C:\path\to\service-account.json && npm run sitemap:firestore
 *
 * Outputs (see .gitignore):
 *   scripts/sitemap-unit-urls.generated.txt
 *   scripts/sitemap-facet-urls.generated.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const scriptsDir = path.join(root, 'scripts')

function slugify(input) {
  return String(input ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function unitSegment(unitNumber) {
  return `unit-${Number(unitNumber) || 0}-important-questions`
}

function facetSearchPath(params) {
  const entries = Object.entries(params)
    .filter(([, v]) => v != null && String(v).length > 0)
    .map(([k, v]) => [k, String(v).toLowerCase()])
    .sort(([a], [b]) => a.localeCompare(b))
  if (entries.length === 0) return ''
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
  return `/search?${qs}`
}

function resolveCredentialPath() {
  const p =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    ''
  if (!p) {
    console.error(
      '[fetch-firestore-sitemap-data] Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_PATH to your service account JSON file.',
    )
    process.exit(1)
  }
  const abs = path.isAbsolute(p) ? p : path.resolve(root, p)
  if (!fs.existsSync(abs)) {
    console.error('[fetch-firestore-sitemap-data] Credential file not found:', abs)
    process.exit(1)
  }
  return abs
}

const credPath = resolveCredentialPath()
const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'))

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()
const FieldPath = admin.firestore.FieldPath

const PAGE = 400
let lastDoc = null
const unitPaths = new Set()
/** @type {Set<string>} */
const facetPaths = new Set()

for (;;) {
  let q = db.collection('questionSets').orderBy(FieldPath.documentId()).limit(PAGE)
  if (lastDoc) q = q.startAfter(lastDoc)
  const snap = await q.get()
  if (snap.empty) break

  for (const doc of snap.docs) {
    const d = doc.data()
    if (d.status !== 'published') continue

    const regulation = String(d.regulation ?? 'r22').toLowerCase()
    const branch = String(d.branch ?? '').toLowerCase()
    const semester = String(d.semester ?? '')
    const subjectSlug = slugify(d.subjectName ?? '')
    const unitNum = Number(d.unitNumber ?? 0)
    if (!branch || !semester || !subjectSlug || unitNum < 1) continue

    const p = `/${regulation}/${branch}/${semester}/${subjectSlug}/${unitSegment(unitNum)}`
    unitPaths.add(p)

    facetPaths.add(facetSearchPath({ regulation, branch, semester }))
    facetPaths.add(facetSearchPath({ regulation, branch }))
    facetPaths.add(facetSearchPath({ regulation }))
  }

  lastDoc = snap.docs[snap.docs.length - 1]
  if (snap.size < PAGE) break
}

const unitsOut = path.join(scriptsDir, 'sitemap-unit-urls.generated.txt')
const facetsOut = path.join(scriptsDir, 'sitemap-facet-urls.generated.json')

fs.writeFileSync(unitsOut, [...unitPaths].sort().join('\n') + '\n', 'utf8')
fs.writeFileSync(
  facetsOut,
  JSON.stringify({ paths: [...facetPaths].filter(Boolean).sort() }, null, 0) + '\n',
  'utf8',
)

console.log(
  '[fetch-firestore-sitemap-data] Wrote',
  unitPaths.size,
  'unit paths →',
  path.relative(root, unitsOut),
)
console.log(
  '[fetch-firestore-sitemap-data] Wrote',
  facetPaths.size,
  'facet index paths →',
  path.relative(root, facetsOut),
)
console.log('[fetch-firestore-sitemap-data] Project:', serviceAccount.project_id)

await admin.app().delete().catch(() => {})
