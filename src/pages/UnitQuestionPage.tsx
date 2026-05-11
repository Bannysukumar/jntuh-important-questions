import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs'
import { CommentSection } from '@/components/comments/CommentSection'
import { SEOHead } from '@/components/seo/SEOHead'
import {
  JsonLdArticle,
  JsonLdBreadcrumb,
  JsonLdFAQPage,
  JsonLdLearningResource,
} from '@/components/seo/JsonLd'
import { ShareButtons } from '@/components/share/ShareButtons'
import { SITE_URL } from '@/lib/constants'
import {
  PDF_DOWNLOAD_DESCRIPTION,
  UNIT_PAGE_INTRO,
  unitPageMetaDescription,
} from '@/lib/siteMessaging'
import { gtagPdfDownload } from '@/lib/gtag'
import { isLocalFavoriteQuestion, toggleLocalFavoriteQuestion } from '@/lib/favoritesLocal'
import { generateQuestionPdf } from '@/lib/pdf/generateQuestionPdf'
import { parseUnitFromSegment, slugify, unitSegment } from '@/lib/slug'
import { unitPageKeywords } from '@/lib/seoKeywords'
import {
  fetchQuestionSetByRoute,
  fetchRelatedQuestionSets,
  fetchSiblingUnitsBySubject,
  incrementQuestionMetric,
} from '@/services/questionsApi'

const UNIT_FAQ = [
  {
    question: 'How do I download this unit as PDF?',
    answer: PDF_DOWNLOAD_DESCRIPTION,
  },
  {
    question: 'Are these questions official JNTUH papers?',
    answer:
      "No. They are independent important-question lists built from previous years' Regular and Supplementary paper analysis and prediction — for revision alongside your syllabus and faculty guidance.",
  },
]

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

  const { data: related = [] } = useQuery({
    queryKey: ['related', data?.id],
    queryFn: () => fetchRelatedQuestionSets(data!, 8),
    enabled: Boolean(data?.id),
  })

  const { data: siblings = [] } = useQuery({
    queryKey: ['siblings', data?.id],
    queryFn: () => fetchSiblingUnitsBySubject(data!),
    enabled: Boolean(data?.id),
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

  const searchBase = `/search?regulation=${data.regulation}&branch=${data.branch}&semester=${encodeURIComponent(data.semester)}`
  const metaDescription = unitPageMetaDescription({
    regulation: data.regulation,
    branch: data.branch,
    semester: data.semester,
    subjectName: data.subjectName,
    subjectCode: data.subjectCode,
    unitNumber: data.unitNumber,
  })
  const kws = [
    ...new Set([...unitPageKeywords(data), ...(data.keywords ?? [])]),
  ].slice(0, 24)

  const sibIdx = siblings.findIndex((q) => q.id === data.id)
  const prevUnit = sibIdx > 0 ? siblings[sibIdx - 1] : null
  const nextUnit =
    sibIdx >= 0 && sibIdx < siblings.length - 1 ? siblings[sibIdx + 1] : null

  return (
    <>
      <SEOHead
        title={data.title}
        description={metaDescription}
        canonicalPath={path}
        ogType="article"
        keywords={kws}
        articlePublishedTime={data.createdAt}
        articleModifiedTime={data.updatedAt}
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Browse', path: '/search' },
          { name: data.regulation.toUpperCase(), path: `/search?regulation=${data.regulation}` },
          {
            name: data.branch.toUpperCase(),
            path: `/search?regulation=${data.regulation}&branch=${data.branch}`,
          },
          {
            name: `Sem ${data.semester}`,
            path: `${searchBase}`,
          },
          { name: data.subjectName, path },
          { name: `Unit ${data.unitNumber}`, path },
        ]}
      />
      <JsonLdArticle
        title={data.title}
        description={`${data.subjectName} (${data.subjectCode}) Unit ${data.unitNumber} — free JNTUH important questions from previous-paper analysis; unit-wise PDF; up to 96% historical accuracy.`}
        path={path}
        datePublished={data.createdAt}
        dateModified={data.updatedAt}
      />
      <JsonLdLearningResource
        name={data.title}
        description={metaDescription}
        path={path}
      />
      <JsonLdFAQPage faqs={UNIT_FAQ} />

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
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Access carefully selected important questions for{' '}
          <strong className="font-medium text-slate-800 dark:text-slate-200">{data.subjectName}</strong> (
          {data.subjectCode}), <strong className="font-medium text-slate-800 dark:text-slate-200">Unit {data.unitNumber}</strong>, semester{' '}
          <strong className="font-medium text-slate-800 dark:text-slate-200">{data.semester}</strong>, regulation{' '}
          <strong className="font-medium text-slate-800 dark:text-slate-200">{data.regulation.toUpperCase()}</strong>, based
          on repeated questions from past Regular and Supplementary examinations. {UNIT_PAGE_INTRO}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            title={PDF_DOWNLOAD_DESCRIPTION}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            onClick={() =>
              void generateQuestionPdf(data, {
                pageUrl: url,
              }).then(() => {
                void incrementQuestionMetric(data.id, 'downloadCount')
                gtagPdfDownload({
                  subject_code: data.subjectCode,
                  regulation: data.regulation,
                  unit: data.unitNumber,
                })
              })
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
          <Link
            to={searchBase}
            className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-slate-50 dark:border-slate-600 dark:text-sky-400 dark:hover:bg-slate-800"
          >
            More {data.branch.toUpperCase()} · Sem {data.semester} →
          </Link>
        </div>
        <div className="mt-4">
          <ShareButtons url={url} title={data.title} questionSetId={data.id} />
        </div>
        {prevUnit || nextUnit ? (
          <nav
            className="mt-6 flex flex-wrap justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40"
            aria-label="Previous and next unit"
          >
            {prevUnit ? (
              <Link
                to={`/${prevUnit.regulation}/${prevUnit.branch}/${prevUnit.semester}/${slugify(prevUnit.subjectName)}/${unitSegment(prevUnit.unitNumber)}`}
                className="font-semibold text-sky-700 hover:underline dark:text-sky-400"
              >
                ← Unit {prevUnit.unitNumber}
              </Link>
            ) : (
              <span />
            )}
            {nextUnit ? (
              <Link
                to={`/${nextUnit.regulation}/${nextUnit.branch}/${nextUnit.semester}/${slugify(nextUnit.subjectName)}/${unitSegment(nextUnit.unitNumber)}`}
                className="font-semibold text-sky-700 hover:underline dark:text-sky-400"
              >
                Unit {nextUnit.unitNumber} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
          Last updated{' '}
          <time dateTime={data.updatedAt}>{new Date(data.updatedAt).toLocaleDateString('en-IN')}</time>
        </p>
      </header>

      <ol className="mt-6 list-decimal space-y-4 pl-5 text-slate-800 dark:text-slate-100">
        {data.questions.map((q, i) => (
          <li key={i} className="leading-relaxed">
            {q}
          </li>
        ))}
      </ol>

      {related.length > 0 ? (
        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Related important questions
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Same semester and branch — more analysis-backed important question units for your exam prep.
          </p>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  className="font-medium text-sky-700 hover:underline dark:text-sky-400"
                  to={`/${r.regulation}/${r.branch}/${r.semester}/${slugify(r.subjectName)}/${unitSegment(r.unitNumber)}`}
                >
                  {r.title}
                </Link>
                <span className="ml-2 text-xs text-slate-500">
                  {r.subjectCode} · {r.downloadCount} downloads
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Common questions</h2>
        <dl className="mt-4 space-y-4">
          {UNIT_FAQ.map((f) => (
            <div key={f.question}>
              <dt className="font-medium text-slate-900 dark:text-white">{f.question}</dt>
              <dd className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <CommentSection questionSetId={data.id} />
    </>
  )
}
