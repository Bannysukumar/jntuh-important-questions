import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

const origin = () => SITE_URL.replace(/\/$/, '')

export function JsonLdOrganization() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${origin()}/pwa-512.png`,
    description:
      'Free JNTUH important questions and unit-wise PDFs for B.Tech students — R18, R22, R24. Search by branch, semester, and subject. Trusted study resources for Hyderabad and Telangana colleges.',
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
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
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
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: input.name,
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
