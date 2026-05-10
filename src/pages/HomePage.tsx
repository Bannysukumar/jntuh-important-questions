import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { JsonLdOrganization } from '@/components/seo/JsonLd'
import { SEOHead } from '@/components/seo/SEOHead'
import { REGULATIONS, SITE_NAME } from '@/lib/constants'
import { slugify, unitSegment } from '@/lib/slug'
import { fetchFeatured } from '@/services/questionsApi'

function regulationLabel(id: string) {
  return REGULATIONS.find((r) => r.id === id)?.label ?? id.toUpperCase()
}

function FeaturedSkeleton() {
  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900/40"
        >
          <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-5 w-4/5 max-w-md rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
          <div className="mt-4 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        </li>
      ))}
    </ul>
  )
}

export function HomePage() {
  const { data: featured = [], isPending, isError } = useQuery({
    queryKey: ['featured'],
    queryFn: () => fetchFeatured(8),
  })

  return (
    <>
      <SEOHead
        title={`${SITE_NAME} — JNTUH unit-wise important questions`}
        description="Search and download JNTUH important questions for R18, R22, and R24. Filter by branch, semester, and subject. PDFs with watermark for students."
        canonicalPath="/"
        keywords={[
          'JNTUH Important Questions',
          'JNTUH Previous Questions',
          'R22 Important Questions',
          'ECE Important Questions',
          'Unit Wise Questions PDF',
        ]}
      />
      <JsonLdOrganization />

      <div className="space-y-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-sky-50/80 to-indigo-50/60 px-6 py-10 shadow-sm dark:border-slate-800/90 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-400/25 blur-3xl dark:bg-sky-500/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
            aria-hidden
          />

          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800 shadow-sm dark:border-sky-500/30 dark:bg-slate-950/60 dark:text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" aria-hidden />
              JNTUH · R18 · R22 · R24
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-[2.65rem]">
              Important questions, organized the way your syllabus is.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              Instant search, crisp PDF downloads with watermark, sharing, and comments after sign-in — built for daily
              study sessions with fast layouts and offline-friendly caching.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Unit-wise pages
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Filter by branch &amp; sem
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                PWA install on mobile
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                Open search
                <svg className="h-4 w-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/r22/ece/2-1/signals-and-systems/unit-1-important-questions"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300/90 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                View sample unit
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Featured sets
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Hand-picked units to jump in quickly — explore the full catalog from search.
              </p>
            </div>
            <Link
              to="/search"
              className="text-sm font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Browse all →
            </Link>
          </div>

          {isPending ? <FeaturedSkeleton /> : null}

          {!isPending && isError ? (
            <div className="mt-6 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-5 py-6 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100">
              Couldn&apos;t load featured sets. Use search to find subjects, or try again in a moment.
            </div>
          ) : null}

          {!isPending && !isError && featured.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/80 px-6 py-14 text-center dark:border-slate-600 dark:bg-slate-900/30">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="mt-4 font-medium text-slate-900 dark:text-white">No featured sets yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
                Admins can mark question sets as featured. Until then, use search and filters to find your subject.
              </p>
              <Link
                to="/search"
                className="mt-6 inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-600/20 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                Go to search
              </Link>
            </div>
          ) : null}

          {!isPending && !isError && featured.length > 0 ? (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {featured.map((q) => (
                <li key={q.id}>
                  <Link
                    to={`/${q.regulation}/${q.branch}/${q.semester}/${slugify(q.subjectName)}/${unitSegment(q.unitNumber)}`}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/50 dark:hover:border-sky-500/40"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {regulationLabel(q.regulation)} · {q.branch.toUpperCase()} · Sem {q.semester}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300">
                      {q.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
                      {q.subjectName}{' '}
                      <span className="text-slate-400 dark:text-slate-500">({q.subjectCode})</span> · {q.questions.length}{' '}
                      prompts
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {q.viewCount.toLocaleString()} views
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        {q.downloadCount.toLocaleString()} downloads
                      </span>
                      <span className="ml-auto font-semibold text-sky-600 dark:text-sky-400">Open →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </>
  )
}
