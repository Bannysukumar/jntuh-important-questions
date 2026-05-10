import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { slugify, unitSegment } from '@/lib/slug'
import type { RegulationId } from '@/types/models'
import { searchQuestionSets } from '@/services/questionsApi'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const regulation = (params.get('regulation') as RegulationId | null) ?? undefined
  const branch = params.get('branch') ?? undefined
  const semester = params.get('semester') ?? undefined

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', q, regulation, branch, semester],
    queryFn: () => searchQuestionSets({ q, regulation, branch, semester }),
  })

  return (
    <>
      <SEOHead
        title={q ? `Search: ${q}` : 'Search JNTUH important questions'}
        description="Filter JNTUH important questions by regulation, branch, semester, subject code, or keyword."
        canonicalPath={`/search${params.toString() ? `?${params.toString()}` : ''}`}
      />
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Search</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        {isFetching ? 'Updating results…' : `${results.length} result(s)`}
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
