import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export function JsonLdOrganization() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'JNTUH important questions portal for R18, R22, and R24 — unit-wise PDFs, search, and study resources.',
    areaServed: 'IN',
    sameAs: [],
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
      item: `${SITE_URL.replace(/\/$/, '')}${it.path.startsWith('/') ? it.path : `/${it.path}`}`,
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
  const url = `${SITE_URL.replace(/\/$/, '')}${input.path}`
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}
