import { useState, type FormEvent } from 'react'
import { SEOHead } from '@/components/seo/SEOHead'
import { useAuth } from '@/contexts/AuthContext'
import { SITE_NAME } from '@/lib/constants'
import { submitFeedback } from '@/services/feedbackApi'

const faqs = [
  {
    q: 'Do I need an account to read questions?',
    a: 'No. Unit pages are open to everyone. Sign in to comment or sync favorites across devices.',
  },
  {
    q: 'How do I download a PDF?',
    a: 'Open any unit page and use “Download PDF”. Files include a watermark and a QR code linking back to the page.',
  },
  {
    q: 'How do I search by regulation or branch?',
    a: 'Open Browse from the sidebar, then pick regulation, branch, and semester and run a search. You can also type a subject name or code.',
  },
  {
    q: 'How do JNTUH results and CGPA work?',
    a: 'This site focuses on unit-wise important questions and study PDFs — not official JNTUH result portals. For results and CGPA, use your college or the official JNTUH student services when they are published.',
  },
  {
    q: 'Why can’t I see admin tools?',
    a: 'Admin access is granted via Firebase (`admins/{your Auth UID}` or `users.role == "admin"`) with matching Firestore rules deployed.',
  },
]

type Panel = 'menu' | 'faq' | 'feedback'

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-5 w-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function BackLink({ onClick, accent }: { onClick: () => void; accent: 'sky' | 'violet' }) {
  const accentCls =
    accent === 'sky'
      ? 'text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10'
      : 'text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold transition ${accentCls}`}
    >
      <ChevronRight className="h-4 w-4 rotate-180" />
      Back to help home
    </button>
  )
}

export function HelpCenterPage() {
  const { user } = useAuth()
  const [panel, setPanel] = useState<Panel>('menu')
  const [message, setMessage] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [guestName, setGuestName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formDone, setFormDone] = useState(false)

  async function onSubmitFeedback(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const trimmed = message.trim()
    if (trimmed.length < 10) {
      setFormError('Please write at least 10 characters.')
      return
    }
    if (!user) {
      const em = contactEmail.trim()
      if (!em || !em.includes('@')) {
        setFormError('Add a valid email so we can follow up if needed.')
        return
      }
    }
    setSubmitting(true)
    try {
      const contactOut = user
        ? contactEmail.trim() || user.email?.trim() || undefined
        : contactEmail.trim()
      const nameOut = user?.displayName?.trim() || guestName.trim() || undefined
      await submitFeedback({
        message: trimmed,
        contactEmail: contactOut,
        authorName: nameOut,
        authorUid: user?.uid ?? undefined,
      })
      setFormDone(true)
      setMessage('')
      setContactEmail('')
      setGuestName('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send feedback. Try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none ring-sky-500/20 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:shadow-none dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/20'

  const labelClass = 'block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'

  return (
    <>
      <SEOHead
        title="Help center"
        description={`Get help using ${SITE_NAME}: FAQs, search, PDFs, and send feedback.`}
        canonicalPath="/help"
      />

      <div className="mx-auto max-w-3xl pb-16">
        {/* Decorative top line — subtle brand accent */}
        <div
          className="pointer-events-none mb-10 h-px w-full bg-gradient-to-r from-transparent via-sky-400/40 to-transparent dark:via-sky-500/30"
          aria-hidden
        />

        {panel === 'menu' ? (
          <div>
            <header className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-600 dark:text-sky-400">Help center</p>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                How can we help you?
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Choose a topic below — browse quick answers or send a message straight to our team.
              </p>
            </header>

            <div className="mt-10 space-y-4">
              <button
                type="button"
                onClick={() => setPanel('faq')}
                className="group relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md dark:border-slate-700/90 dark:bg-slate-900/40 dark:hover:border-sky-500/40 sm:p-6"
              >
                <span className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-sky-400 to-sky-600 opacity-90" aria-hidden />
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-600/25">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
                <span className="relative min-w-0 flex-1 pl-1">
                  <span className="block font-semibold text-slate-900 dark:text-white">Frequent questions</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Browse common questions about JNTUH prep, search, PDFs, and how the site works.
                  </span>
                </span>
                <ChevronRight className="relative h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPanel('feedback')
                  setFormDone(false)
                  setFormError(null)
                }}
                className="group relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md dark:border-slate-700/90 dark:bg-slate-900/40 dark:hover:border-violet-500/40 sm:p-6"
              >
                <span className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-violet-400 to-violet-600 opacity-90" aria-hidden />
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-violet-400/80 bg-violet-500/10 text-violet-600 dark:border-violet-400 dark:bg-violet-500/15 dark:text-violet-300">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </span>
                <span className="relative min-w-0 flex-1 pl-1">
                  <span className="block font-semibold text-slate-900 dark:text-white">Suggestion / Feedback</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Share feedback or ideas to help us improve — every suggestion counts.
                  </span>
                </span>
                <ChevronRight className="relative h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
              </button>
            </div>
          </div>
        ) : null}

        {panel === 'faq' ? (
          <div>
            <BackLink onClick={() => setPanel('menu')} accent="sky" />
            <header className="mt-6 border-b border-slate-200 pb-8 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">Knowledge base</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                Frequent questions
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Short answers to the most common questions. Still stuck? Use feedback and we’ll help.
              </p>
            </header>
            <ul className="mt-8 space-y-3">
              {faqs.map((item, i) => (
                <li
                  key={item.q}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-6"
                >
                  <div className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-xs font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">{item.q}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {panel === 'feedback' ? (
          <div>
            <BackLink onClick={() => setPanel('menu')} accent="violet" />
            <header className="mt-6 border-b border-slate-200 pb-8 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">Contact</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                Suggestion / Feedback
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Your message goes to site administrators. We read every submission and use it to improve the experience.
              </p>
            </header>

            <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
              {formDone ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-5 py-6 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100">
                  <p className="font-semibold">Thank you — your feedback was submitted.</p>
                  <p className="mt-2 text-emerald-800/90 dark:text-emerald-200/90">We read every message and appreciate you taking the time.</p>
                </div>
              ) : (
                <form onSubmit={onSubmitFeedback} className="space-y-5">
                  {!user ? (
                    <>
                      <div>
                        <label htmlFor="fb-email" className={labelClass}>
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="fb-email"
                          type="email"
                          autoComplete="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className={inputClass}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="fb-name" className={labelClass}>
                          Name <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                          id="fb-name"
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className={inputClass}
                          placeholder="Your name"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
                      <span className="text-slate-500 dark:text-slate-500">Signed in as </span>
                      <span className="font-medium text-slate-900 dark:text-white">{user.email}</span>
                      {user.displayName ? (
                        <span className="text-slate-600 dark:text-slate-400"> · {user.displayName}</span>
                      ) : null}
                    </div>
                  )}

                  {user ? (
                    <div>
                      <label htmlFor="fb-email-opt" className={labelClass}>
                        Alternate email <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        id="fb-email-opt"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className={inputClass}
                        placeholder="Different from login, if you prefer"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label htmlFor="fb-msg" className={labelClass}>
                      Your message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="fb-msg"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${inputClass} resize-y min-h-[140px]`}
                      placeholder="Describe your suggestion, issue, or idea…"
                    />
                  </div>

                  {formError ? <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{formError}</p> : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-60 dark:shadow-violet-900/40 dark:focus-visible:ring-offset-slate-900"
                  >
                    {submitting ? 'Sending…' : 'Submit feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
