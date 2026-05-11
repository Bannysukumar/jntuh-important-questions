import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { SEOHead } from '@/components/seo/SEOHead'
import { JsonLdAggregateRating } from '@/components/seo/JsonLd'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { shouldBlockComment } from '@/lib/moderation'
import { deleteSiteRating, subscribeSiteRatings, upsertSiteRating } from '@/services/siteRatingsApi'
import { isFirebaseConfigured } from '@/services/firebase/config'
import type { SiteRatingDoc } from '@/types/models'
import { GLOBAL_SEO_KEYWORDS } from '@/lib/seoKeywords'
import {
  RATINGS_PRIMARY_CTA,
  RATINGS_SEO_DESCRIPTION,
  RATINGS_UPDATE_CTA,
} from '@/lib/siteMessaging'

function formatRatingAuthor(name: string, isAdmin: boolean): string {
  if (!isAdmin) return name
  return name.includes('(Admin)') ? name : `${name} (Admin)`
}

function StarsDisplay({ stars, size = 'md' }: { stars: number; size?: 'sm' | 'md' }) {
  const n = Math.min(5, Math.max(0, Math.round(stars)))
  const cls = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`${cls} ${s <= n ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

/** Shown when no one has rated yet — aligns with the ~96% exam-coverage benchmark on About. */
const BASELINE_SITE_SCORE_PCT = 96
/** Star average equivalent to the baseline percentage (96 / 20). */
const BASELINE_AVG_STARS = (BASELINE_SITE_SCORE_PCT / 100) * 5

function SiteScoreGauge({ percentage }: { percentage: number }) {
  const pct = Math.min(100, Math.max(0, percentage))
  const size = 200
  const stroke = 12
  const r = (size - stroke) / 2 - 6
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - pct / 100)

  /** Muted track vs bright progress arc (always two distinct colours). */
  const trackClass = 'stroke-slate-300 dark:stroke-slate-600'
  const progressClass =
    pct >= 80
      ? 'stroke-emerald-500 dark:stroke-emerald-400'
      : pct >= 65
        ? 'stroke-teal-500 dark:stroke-teal-400'
        : pct >= 50
          ? 'stroke-sky-500 dark:stroke-sky-400'
          : pct >= 35
            ? 'stroke-amber-500 dark:stroke-amber-400'
            : 'stroke-orange-500 dark:stroke-orange-400'

  return (
    <div
      className="relative mx-auto flex h-[220px] w-[220px] shrink-0 items-center justify-center rounded-3xl bg-slate-100 dark:bg-[#0f172a] sm:mx-0"
      aria-hidden
    >
      <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          className={trackClass}
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          className={`${progressClass} transition-[stroke-dashoffset] duration-700 ease-out`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-[2.75rem] font-bold leading-none tabular-nums tracking-tight text-slate-900 dark:text-white">
          {pct}
        </span>
        <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          out of 100
        </span>
      </div>
    </div>
  )
}

function firebaseMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code)
    if (code === 'permission-denied') return 'Permission denied. Deploy the latest Firestore rules for site ratings.'
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Try again.'
}

export function SiteRatingsPage() {
  const { user, isAdmin } = useAuth()
  const { openAuth } = useAuthModal()
  const [rows, setRows] = useState<SiteRatingDoc[]>([])
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const lastSyncedUpdatedAt = useRef<string | null>(null)

  useEffect(() => {
    return subscribeSiteRatings(setRows)
  }, [])

  const myRating = useMemo(
    () => (user ? rows.find((r) => r.authorUid === user.uid) ?? null : null),
    [rows, user],
  )

  useEffect(() => {
    queueMicrotask(() => {
      if (!user) {
        setStars(5)
        setComment('')
        lastSyncedUpdatedAt.current = null
        return
      }
      if (!myRating) {
        if (lastSyncedUpdatedAt.current !== null) {
          lastSyncedUpdatedAt.current = null
          setStars(5)
          setComment('')
        }
        return
      }
      if (lastSyncedUpdatedAt.current === myRating.updatedAt) return
      lastSyncedUpdatedAt.current = myRating.updatedAt
      setStars(myRating.stars)
      setComment(myRating.comment)
    })
  }, [user, myRating])

  const stats = useMemo(() => {
    const count = rows.length
    if (count === 0) {
      return {
        count: 0,
        avg: BASELINE_AVG_STARS,
        displayPct: BASELINE_SITE_SCORE_PCT,
        fromLive: false,
      }
    }
    const sum = rows.reduce((a, r) => a + r.stars, 0)
    const avg = sum / count
    const displayPct = Math.round((avg / 5) * 100)
    return {
      count,
      avg: Math.round(avg * 10) / 10,
      displayPct,
      fromLive: true,
    }
  }, [rows])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!user) {
      openAuth('login', '/ratings')
      return
    }
    if (shouldBlockComment(comment)) {
      setFormError('This comment cannot be posted. Please remove links or inappropriate language.')
      return
    }
    setPending(true)
    try {
      await upsertSiteRating({
        uid: user.uid,
        authorName: formatRatingAuthor(user.displayName ?? user.email ?? 'Student', isAdmin),
        stars,
        comment,
        existing: myRating,
      })
    } catch (err) {
      setFormError(firebaseMessage(err))
    } finally {
      setPending(false)
    }
  }

  async function onDelete() {
    if (!user || !myRating) return
    if (!window.confirm('Remove your rating and comment from the site?')) return
    setFormError(null)
    setDeleting(true)
    try {
      await deleteSiteRating(user.uid)
      lastSyncedUpdatedAt.current = null
    } catch (err) {
      setFormError(firebaseMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <SEOHead
        title={`Site ratings · ${SITE_NAME}`}
        description={RATINGS_SEO_DESCRIPTION}
        canonicalPath="/ratings"
        keywords={[...GLOBAL_SEO_KEYWORDS]}
      />
      {stats.fromLive && stats.count > 0 ? (
        <JsonLdAggregateRating
          name={`${SITE_NAME} — student ratings`}
          url={`${SITE_URL.replace(/\/$/, '')}/ratings`}
          ratingValue={stats.avg}
          reviewCount={stats.count}
        />
      ) : null}

      <div className="mx-auto max-w-3xl">
        <header className="border-b border-slate-200 pb-8 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">Community</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Site ratings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {RATINGS_SEO_DESCRIPTION} You can edit or delete your own entry anytime; updates appear live when Firebase is
            enabled.
          </p>
        </header>

        {!isFirebaseConfigured() ? (
          <p className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
            Firebase is not configured — ratings are stored in memory for this session only and are not shared across devices.
          </p>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/80 to-sky-50/40 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-sky-950/20 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Site trust score</h2>

          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
            <div className="relative" role="img" aria-label={`Site score ${stats.displayPct} out of 100`}>
              <SiteScoreGauge percentage={stats.displayPct} />
            </div>

            <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {stats.fromLive ? 'Live community score' : 'Community score'}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {stats.displayPct}%
                </p>
                {stats.fromLive ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Average <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.avg}</span> / 5
                    stars from{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.count}</span>{' '}
                    {stats.count === 1 ? 'rating' : 'ratings'}.
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <StarsDisplay stars={Math.round(stats.avg)} />
                {stats.fromLive ? (
                  <span className="text-xs text-slate-500 dark:text-slate-500">From student votes</span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {myRating ? 'Your rating' : 'Add your rating'}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {user
              ? 'Choose 1–5 stars and an optional comment. Submit to post or update your entry.'
              : 'Sign in to post a rating. You can still read everyone else’s feedback below.'}
          </p>

          {formError ? (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-800 dark:text-red-200">
              {formError}
            </p>
          ) : null}

          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Stars
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      stars === s
                        ? 'border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-100'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600'
                    }`}
                  >
                    {s}★
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Comment (optional)
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="What helps you most on this site? What could be better?"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500/50 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <span className="mt-1 block text-right text-xs text-slate-400">{comment.length} / 2000</span>
            </label>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <>
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 disabled:opacity-50"
                  >
                    {pending ? 'Saving…' : myRating ? RATINGS_UPDATE_CTA : RATINGS_PRIMARY_CTA}
                  </button>
                  {myRating ? (
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => void onDelete()}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {deleting ? 'Removing…' : 'Delete my rating'}
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuth('login', '/ratings')}
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
                >
                  Sign in to submit your live rating
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">What students are saying</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Newest updates first. Only you can change or remove your own entry.
          </p>

          {rows.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No ratings yet. Be the first to share feedback.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {rows.map((r) => {
                const isMine = Boolean(user && r.authorUid === user.uid)
                return (
                  <li
                    key={r.id}
                    className={`rounded-2xl border p-5 shadow-sm dark:bg-slate-900/40 ${
                      isMine
                        ? 'border-amber-300/80 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5'
                        : 'border-slate-200/90 bg-white dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{r.authorName}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Updated {new Date(r.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <StarsDisplay stars={r.stars} size="sm" />
                    </div>
                    {r.comment ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {r.comment}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm italic text-slate-400 dark:text-slate-500">No written comment.</p>
                    )}
                    {isMine ? (
                      <p className="mt-3 text-xs font-medium text-amber-800 dark:text-amber-200">
                        This is your rating — use the form above to edit stars or text, or delete it.
                      </p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
