/**
 * Same as build-sitemaps.mjs but defaults to smaller chunks so you get many
 * sitemap part files when you have hundreds of unit URLs (optional SEO sharding).
 *
 * Override: SITEMAP_UNIT_CHUNK_SIZE, SITEMAP_FACET_CHUNK_SIZE
 */
process.env.SITEMAP_UNIT_CHUNK_SIZE = process.env.SITEMAP_UNIT_CHUNK_SIZE || '3'
process.env.SITEMAP_FACET_CHUNK_SIZE = process.env.SITEMAP_FACET_CHUNK_SIZE || '1'
await import(new URL('./build-sitemaps.mjs', import.meta.url).href)
