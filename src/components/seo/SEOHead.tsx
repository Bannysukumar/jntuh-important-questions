import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export interface SEOHeadProps {
  title: string
  description: string
  canonicalPath: string
  ogType?: 'website' | 'article'
  keywords?: string[]
  noindex?: boolean
}

export function SEOHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  keywords = [],
  noindex = false,
}: SEOHeadProps) {
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`
  const canonical = `${SITE_URL.replace(/\/$/, '')}${path}`
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : null}
    </Helmet>
  )
}
