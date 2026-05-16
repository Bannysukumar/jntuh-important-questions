import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicHomeSettings } from '@/services/adminApi'
import {
  JsonLdFAQPage,
  JsonLdOrganization,
  JsonLdWebSiteSearch,
} from '@/components/seo/JsonLd'
import { SEOHead } from '@/components/seo/SEOHead'
import { getHomeSeoFaqs } from '@/lib/homeFaqSeo'
import { BRANCHES } from '@/lib/constants'
import {
  HOME_CTA_PRIMARY_LABEL,
  HOME_CTA_SECONDARY_LABEL,
  HOME_HERO_HEADLINE,
  HOME_HERO_SUB,
  HOME_VALUE_SECTION_BODY,
  HOME_VALUE_SECTION_TITLE,
  META_DESCRIPTION_DEFAULT,
  TRUST_BADGES,
} from '@/lib/siteMessaging'
import { useRegulations } from '@/hooks/useRegulations'
import { effectiveHomeBranchIds } from '@/lib/homeBranchUtils'
import { GLOBAL_SEO_KEYWORDS } from '@/lib/seoKeywords'
import { slugify, unitSegment } from '@/lib/slug'
import { fetchFeatured, fetchPublishedQuestionSets } from '@/services/questionsApi'
import type { QuestionSet } from '@/types/models'

function regulationLabel(id: string, list: { id: string; label: string }[]) {
  return list.find((r) => r.id === id)?.label ?? id.toUpperCase()
}

function branchLabel(id: string) {
  return BRANCHES.find((b) => b.id === id)?.label ?? id.toUpperCase()
}

function homeUnitPath(q: QuestionSet) {
  return `/${q.regulation}/${q.branch}/${q.semester}/${slugify(q.subjectName)}/${unitSegment(q.unitNumber)}`
}

function HomeUnitCard({
  q,
  regulations,
}: {
  q: QuestionSet
  regulations: { id: string; label: string }[]
}) {
  return (
    <Link
      to={homeUnitPath(q)}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/50 dark:hover:border-sky-500/40"
    >
      <div className="flex flex-wrap gap-1.5">
        {q.important ? (
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
            Important
          </span>
        ) : null}
        {q.popular ? (
          <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900 dark:bg-violet-500/20 dark:text-violet-200">
            Popular
          </span>
        ) : null}
        {q.featured ? (
          <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-900 dark:bg-sky-500/20 dark:text-sky-200">
            Featured
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {regulationLabel(q.regulation, regulations)} · {q.branch.toUpperCase()} · Sem {q.semester}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300">
        {q.title}
      </h3>
      <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {q.subjectName} <span className="text-slate-400 dark:text-slate-500">({q.subjectCode})</span> · {q.questions.length}{' '}
        prompts
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
        <span className="tabular-nums">{q.viewCount.toLocaleString()} views</span>
        <span className="tabular-nums">{q.downloadCount.toLocaleString()} downloads</span>
        <span className="ml-auto font-semibold text-sky-600 dark:text-sky-400">Open →</span>
      </div>
    </Link>
  )
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
  const homeFaqs = useMemo(() => getHomeSeoFaqs(), [])
  const { regulations } = useRegulations()

  const { data: featured = [], isPending, isError } = useQuery({
    queryKey: ['featured'],
    queryFn: () => fetchFeatured(8),
  })

  const { data: homeSettings } = useQuery({
    queryKey: ['publicHomeSettings'],
    queryFn: fetchPublicHomeSettings,
  })

  const { data: catalog = [], isPending: catalogPending } = useQuery({
    queryKey: ['homePublishedCatalog'],
    queryFn: () => fetchPublishedQuestionSets(220),
  })

  const visibleBranchIds = useMemo(() => {
    const homeBranchIds = homeSettings?.homeBranchIds ?? []
    return effectiveHomeBranchIds(homeBranchIds)
  }, [homeSettings])

  const topPicks = useMemo(() => {
    const important = catalog.filter((s) => s.important)
    const popularOnly = catalog.filter((s) => s.popular && !s.important)
    const seen = new Set<string>()
    const out: QuestionSet[] = []
    for (const s of [...important, ...popularOnly]) {
      if (seen.has(s.id)) continue
      seen.add(s.id)
      out.push(s)
    }
    return out.slice(0, 10)
  }, [catalog])

  const setsByBranch = useMemo(() => {
    const map = new Map<string, QuestionSet[]>()
    for (const bid of visibleBranchIds) {
      const list = catalog
        .filter((s) => s.branch === bid && s.showOnHome)
        .sort((a, b) => b.downloadCount - a.downloadCount || b.viewCount - a.viewCount)
        .slice(0, 10)
      map.set(bid, list)
    }
    return map
  }, [catalog, visibleBranchIds])

  return (
    <>
      <SEOHead
        title="JNTUH Important Questions | Free unit-wise PDFs & exam prep"
        description={META_DESCRIPTION_DEFAULT}
        canonicalPath="/"
        keywords={[...GLOBAL_SEO_KEYWORDS]}
      />
      <JsonLdOrganization />
      <JsonLdWebSiteSearch />
      <JsonLdFAQPage faqs={homeFaqs} />

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
              Free for every JNTUH B.Tech student
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-[2.65rem]">
              {HOME_HERO_HEADLINE}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              {HOME_HERO_SUB} Our mission is to help you prepare smarter, score better, and pass confidently — with
              continuous updates before every examination.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {TRUST_BADGES.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-200"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
              >
                {HOME_CTA_PRIMARY_LABEL}
                <svg className="h-4 w-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300/90 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-white dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {HOME_CTA_SECONDARY_LABEL}
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center rounded-2xl border border-sky-200/90 bg-sky-50/90 px-6 py-3 text-sm font-semibold text-sky-900 shadow-sm transition hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50"
              >
                Exam prep blog
              </Link>
            </div>
            </div>
          </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white px-6 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:px-8">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">{HOME_VALUE_SECTION_TITLE}</h2>
          <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-slate-600 dark:text-slate-400">
            {HOME_VALUE_SECTION_BODY}
          </p>
        </section>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Top picks
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                High-impact units flagged from our catalogue — important picks first, then popular. Open any card for
                unit-wise questions from paper analysis and prediction.
              </p>
            </div>
            <Link
              to="/search"
              className="text-sm font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Browse all →
            </Link>
          </div>
          {catalogPending ? <FeaturedSkeleton /> : null}
          {!catalogPending && topPicks.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              No Important or Popular units yet. Use Admin → Home layout to flag units, or open search.
            </p>
          ) : null}
          {!catalogPending && topPicks.length > 0 ? (
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {topPicks.map((q) => (
                <li key={q.id}>
                  <HomeUnitCard q={q} regulations={regulations} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Featured sets
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Curated starting points — same analysis-backed important questions, free PDFs, and ratings after your
                exams.
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
                  <HomeUnitCard q={q} regulations={regulations} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Browse by branch
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Branch-wise unit lists for faster revision — Regular &amp; Supplementary patterns, all regulations we
                publish, updated on the schedule students rely on before exams.
              </p>
            </div>
          </div>
          {catalogPending ? <FeaturedSkeleton /> : null}
          {!catalogPending ? (
            <div className="mt-8 space-y-10">
              {visibleBranchIds.map((bid) => {
                const rows = setsByBranch.get(bid) ?? []
                return (
                  <div key={bid}>
                    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-700">
                      <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                        {branchLabel(bid)}
                      </h3>
                      <Link
                        to={`/search?branch=${encodeURIComponent(bid)}`}
                        className="text-sm font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                      >
                        All {branchLabel(bid)} →
                      </Link>
                    </div>
                    {rows.length === 0 ? (
                      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        No units on the home page for this branch yet.
                      </p>
                    ) : (
                      <ul className="mt-4 grid gap-4 md:grid-cols-2">
                        {rows.map((q) => (
                          <li key={q.id}>
                            <HomeUnitCard q={q} regulations={regulations} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-slate-50/90 px-6 py-8 dark:border-slate-800 dark:bg-slate-950/40 sm:px-8">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Frequently asked questions
          </h2>
          <dl className="mt-6 space-y-5">
            {homeFaqs.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold text-slate-900 dark:text-white">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}
