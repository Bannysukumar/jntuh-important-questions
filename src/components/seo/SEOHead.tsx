import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export interface SEOHeadProps {
  title: string
  description: string
  canonicalPath: string
  ogType?: 'website' | 'article'
  keywords?: string[]
  noindex?: boolean
  /** Absolute image URL for OG/Twitter; defaults to site OG image */
  ogImage?: string
  articlePublishedTime?: string
  articleModifiedTime?: string
}

function defaultOgImage(): string {
  const custom = import.meta.env.VITE_OG_IMAGE_URL
  if (typeof custom === 'string' && custom.startsWith('http')) return custom
  return `${SITE_URL.replace(/\/$/, '')}/pwa-512.png`
}

export function SEOHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  keywords = [],
  noindex = false,
  ogImage,
  articlePublishedTime,
  articleModifiedTime,
}: SEOHeadProps) {
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
  const canonical = `${SITE_URL.replace(/\/$/, '')}${path}`
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const imageUrl = ogImage ?? defaultOgImage()
  const verification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'} />

      {/* Geographic / locale hints for India / Telangana education searches */}
      <meta httpEquiv="content-language" content="en-IN" />
      <meta property="og:locale" content="en_IN" />
      <meta name="geo.region" content="IN-TG" />
      <meta name="geo.placename" content="Hyderabad, Telangana, India" />
      <meta name="audience" content="students, JNTUH B.Tech" />
      <meta name="target" content="JNTUH engineering students" />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content={`${SITE_NAME} — JNTUH study resources`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {ogType === 'article' && articlePublishedTime ? (
        <meta property="article:published_time" content={articlePublishedTime} />
      ) : null}
      {ogType === 'article' && articleModifiedTime ? (
        <meta property="article:modified_time" content={articleModifiedTime} />
      ) : null}

      {verification ? <meta name="google-site-verification" content={verification} /> : null}
    </Helmet>
  )
}
