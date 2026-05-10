import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { gtagSearch } from '@/lib/gtag'
import { GLOBAL_SEO_KEYWORDS } from '@/lib/seoKeywords'
import { slugify, unitSegment } from '@/lib/slug'
import type { RegulationId } from '@/types/models'
import { searchQuestionSets } from '@/services/questionsApi'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const regulation = (params.get('regulation') as RegulationId | null) ?? undefined
  const branch = params.get('branch') ?? undefined
  const semester = params.get('semester') ?? undefined
  const tracked = useRef<string>('')

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', q, regulation, branch, semester],
    queryFn: () => searchQuestionSets({ q, regulation, branch, semester }),
  })

  useEffect(() => {
    const key = [q, regulation ?? '', branch ?? '', semester ?? ''].join('|')
    if (tracked.current === key) return
    tracked.current = key
    if (!q && !regulation && !branch && !semester) return
    gtagSearch({ search_term: q, regulation, branch, semester })
  }, [q, regulation, branch, semester])

  const searchTitle = q
    ? `JNTUH search: ${q}`
    : 'Search JNTUH important questions by branch, semester & subject'

  return (
    <>
      <SEOHead
        title={searchTitle}
        description="Find JNTUH important questions, previous exam patterns, and PDF downloads. Filter by R18, R22, R24, branch (CSE, ECE, EEE, MECH, CIVIL), and semester — built for B.Tech students in Telangana."
        canonicalPath="/search"
        keywords={[...GLOBAL_SEO_KEYWORDS]}
      />
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
        Search JNTUH important questions
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
        Browse unit-wise question banks for engineering branches under JNTUH. Combine regulation, branch, and semester
        filters with keywords (subject name or code) to find mid-exam and external exam important topics faster.
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
        {isFetching ? 'Updating results…' : `${results.length} result${results.length === 1 ? '' : 's'}`}
      </p>
      <ul className="mt-6 space-y-3">
        {results.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <Link
              className="font-semibold text-brand-700 hover:underline dark:text-sky-400"
              to={`/${item.regulation}/${item.branch}/${item.semester}/${slugify(item.subjectName)}/${unitSegment(item.unitNumber)}`}
            >
              {item.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {item.subjectCode} · Unit {item.unitNumber} · {item.downloadCount} downloads
            </p>
          </li>
        ))}
        {!isFetching && results.length === 0 ? (
          <li className="text-slate-500">Try another keyword or clear filters.</li>
        ) : null}
      </ul>
    </>
  )
}
