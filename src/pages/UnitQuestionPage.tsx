import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { CommentSection } from '@/components/comments/CommentSection'
import { SEOHead } from '@/components/seo/SEOHead'
import { JsonLdArticle, JsonLdBreadcrumb } from '@/components/seo/JsonLd'
import { ShareButtons } from '@/components/share/ShareButtons'
import { SITE_URL } from '@/lib/constants'
import { isLocalFavoriteQuestion, toggleLocalFavoriteQuestion } from '@/lib/favoritesLocal'
import { generateQuestionPdf } from '@/lib/pdf/generateQuestionPdf'
import { parseUnitFromSegment, slugify, unitSegment } from '@/lib/slug'
import {
  fetchQuestionSetByRoute,
  incrementQuestionMetric,
} from '@/services/questionsApi'

export function UnitQuestionPage() {
  const { regulation, branch, semester, subjectSlug, unitSlug } = useParams()
  const unitNum = unitSlug ? parseUnitFromSegment(unitSlug) : null
  const [favBump, setFavBump] = useState(0)

  const enabled = Boolean(regulation && branch && semester && subjectSlug && unitNum != null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['question', regulation, branch, semester, subjectSlug, unitNum],
    queryFn: () =>
      fetchQuestionSetByRoute({
        regulation: regulation!,
        branch: branch!,
        semester: semester!,
        subjectSlug: subjectSlug!,
        unitNumber: unitNum!,
      }),
    enabled,
  })

  useEffect(() => {
    if (!data?.id) return
    void incrementQuestionMetric(data.id, 'viewCount')
  }, [data?.id])

  void favBump
  const fav = data?.id ? isLocalFavoriteQuestion(data.id) : false

  if (!enabled || unitNum == null) {
    return <p className="text-slate-600">Invalid URL.</p>
  }

  if (isLoading) {
    return <p className="text-slate-600">Loading question set…</p>
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
        <h1 className="font-display text-xl font-semibold text-amber-900 dark:text-amber-100">
          Not found
        </h1>
        <p className="mt-2 text-amber-800 dark:text-amber-200">
          No published set matches this path yet. Seed Firestore or use the demo link from the home
          page.
        </p>
      </div>
    )
  }

  const path = `/${data.regulation}/${data.branch}/${data.semester}/${slugify(data.subjectName)}/${unitSegment(data.unitNumber)}`
  const url = `${SITE_URL.replace(/\/$/, '')}${path}`

  return (
    <>
      <SEOHead
        title={data.title}
        description={`${data.subjectName} (${data.subjectCode}) — Unit ${data.unitNumber} important questions for JNTUH ${data.regulation.toUpperCase()}.`}
        canonicalPath={path}
        ogType="article"
        keywords={data.keywords}
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: data.regulation.toUpperCase(), path: `/${data.regulation}` },
          { name: data.branch.toUpperCase(), path },
          { name: data.title, path },
        ]}
      />
      <JsonLdArticle
        title={data.title}
        description={`Unit ${data.unitNumber} important questions — ${data.subjectName}`}
        path={path}
        datePublished={data.createdAt}
        dateModified={data.updatedAt}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: data.regulation.toUpperCase() },
          { label: data.branch.toUpperCase() },
          { label: data.semester },
          { label: data.subjectName },
          { label: `Unit ${data.unitNumber}` },
        ]}
      />

      <header className="mt-6">
        <p className="text-sm font-semibold text-brand-700 dark:text-sky-300">
          {data.regulation.toUpperCase()} · {data.branch.toUpperCase()} · {data.semester} ·{' '}
          {data.subjectCode}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
          {data.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            onClick={() =>
              void generateQuestionPdf(data, {
                pageUrl: url,
              }).then(() => incrementQuestionMetric(data.id, 'downloadCount'))
            }
          >
            Download PDF
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700"
            onClick={() => {
              toggleLocalFavoriteQuestion(data.id)
              setFavBump((b) => b + 1)
            }}
          >
            {fav ? '★ Saved' : '☆ Save favorite'}
          </button>
        </div>
        <div className="mt-4">
          <ShareButtons url={url} title={data.title} questionSetId={data.id} />
        </div>
      </header>

      <ol className="mt-6 list-decimal space-y-4 pl-5 text-slate-800 dark:text-slate-100">
        {data.questions.map((q, i) => (
          <li key={i} className="leading-relaxed">
            {q}
          </li>
        ))}
      </ol>

      <CommentSection questionSetId={data.id} />
    </>
  )
}
