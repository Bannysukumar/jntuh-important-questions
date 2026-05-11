/**
 * Writes public/pwa-192.png and public/pwa-512.png at exact manifest sizes.
 * Source: public/favicon.png (square crop, center).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const faviconPath = path.join(root, 'public', 'favicon.png')

if (!fs.existsSync(faviconPath)) {
  console.warn('[generate-pwa-icons] public/favicon.png missing; skip')
  process.exit(0)
}

const mk = (size, outName) =>
  sharp(faviconPath)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(path.join(root, 'public', outName))

await mk(192, 'pwa-192.png')
await mk(512, 'pwa-512.png')

console.log('[generate-pwa-icons] wrote pwa-192.png (192×192), pwa-512.png (512×512)')
