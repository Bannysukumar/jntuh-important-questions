import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { JSON_LD_ORGANIZATION_DESCRIPTION } from '@/lib/siteMessaging'
import { formatDocumentTitle } from '@/lib/seoTitles'

const origin = () => SITE_URL.replace(/\/$/, '')

export function JsonLdOrganization() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${origin()}/pwa-512.png`,
    description: JSON_LD_ORGANIZATION_DESCRIPTION,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Telangana',
      containedInPlace: { '@type': 'Country', name: 'India' },
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      geographicArea: 'IN',
    },
    sameAs: [],
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

/** WebSite + SearchAction for sitelinks search box eligibility */
export function JsonLdWebSiteSearch() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'en-IN',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin()}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

export function JsonLdBreadcrumb({ items }: { items: { name: string; path: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${origin()}${it.path.startsWith('/') ? it.path : `/${it.path}`}`,
    })),
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

export function JsonLdArticle(input: {
  title: string
  description: string
  path: string
  datePublished: string
  dateModified: string
}) {
  const url = `${origin()}${input.path}`
  const headline = formatDocumentTitle(input.title)
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${origin()}/pwa-512.png` },
    },
    isAccessibleForFree: true,
    educationalLevel: 'undergraduate',
    inLanguage: 'en-IN',
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

/** Learning resource for unit question banks (complements Article) */
export function JsonLdLearningResource(input: {
  name: string
  description: string
  path: string
  educationalLevel?: string
}) {
  const url = `${origin()}${input.path}`
  const name = formatDocumentTitle(input.name)
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name,
    description: input.description,
    url,
    isAccessibleForFree: true,
    learningResourceType: 'Study guide',
    educationalLevel: input.educationalLevel ?? 'undergraduate',
    inLanguage: 'en-IN',
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

/** Live community ratings only — avoid fabricated aggregate ratings in structured data. */
export function JsonLdAggregateRating(input: {
  name: string
  url: string
  ratingValue: number
  reviewCount: number
  bestRating?: number
  worstRating?: number
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    url: input.url,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(input.ratingValue),
      reviewCount: String(input.reviewCount),
      bestRating: String(input.bestRating ?? 5),
      worstRating: String(input.worstRating ?? 1),
    },
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

export function JsonLdFAQPage({
  faqs,
}: {
  faqs: { question: string; answer: string }[]
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}
