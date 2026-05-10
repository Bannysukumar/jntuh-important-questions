import { Link } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { SITE_NAME } from '@/lib/constants'

export function AboutPage() {
  return (
    <>
      <SEOHead
        title="About us"
        description={`${SITE_NAME} — unit-wise JNTUH important questions, search, PDFs, and study resources for engineering students.`}
        canonicalPath="/about"
      />

      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          About us
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          About {SITE_NAME}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {SITE_NAME} is built for students of{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">
            Jawaharlal Nehru Technological University Hyderabad (JNTUH)
          </strong>{' '}
          and affiliated colleges who want reliable, organised access to important exam questions — without
          digging through scattered PDFs and chat groups.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            What we focus on
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            Exam preparation works best when material matches how your syllabus is written: by{' '}
            <strong className="text-slate-800 dark:text-slate-200">regulation</strong>,{' '}
            <strong className="text-slate-800 dark:text-slate-200">branch</strong>,{' '}
            <strong className="text-slate-800 dark:text-slate-200">semester</strong>,{' '}
            <strong className="text-slate-800 dark:text-slate-200">subject</strong>, and{' '}
            <strong className="text-slate-800 dark:text-slate-200">unit</strong>. We structure content
            that way so you can revise one unit at a time or jump straight to what you need before
            internals and end exams.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            What you can do here
          </h2>
          <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-400">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>
                <strong className="text-slate-800 dark:text-slate-200">Browse and search</strong> — filter
                by regulation (R18, R22, R24-ready), branch, semester, subject name, or code, with quick
                search from any page.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>
                <strong className="text-slate-800 dark:text-slate-200">Read important questions</strong> —{' '}
                unit-wise lists for revision, with clear URLs you can bookmark or share with classmates.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>
                <strong className="text-slate-800 dark:text-slate-200">Download PDFs</strong> — export
                questions with a watermark and metadata so copies stay traceable to the source page.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>
                <strong className="text-slate-800 dark:text-slate-200">Sign in to engage</strong> — post
                comments (where enabled), save favorites, and keep your session consistent across devices
                when connected to your account.
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Who this is for
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            Undergraduate and postgraduate learners across major branches —{' '}
            <abbr title="Computer Science and Engineering">CSE</abbr>,{' '}
            <abbr title="Electronics and Communication Engineering">ECE</abbr>,{' '}
            <abbr title="Electrical and Electronics Engineering">EEE</abbr>, Mechanical, Civil, IT, and
            emerging programmes like AI/ML and Data Science — who follow JNTUH curricula and want a
            single place to consolidate important questions and last-minute revision.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Our approach
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            We prioritise a fast, readable interface, mobile-friendly layout, dark mode for night study,
            and secure sign-in when you choose to use comments or saved items. Content can grow over time
            as more question sets are curated and published; always cross-check critical topics with your
            faculty and official syllabus.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Independent resource
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {SITE_NAME} is an independent educational project. It is{' '}
            <strong className="text-slate-800 dark:text-slate-200">not affiliated with or endorsed by</strong>{' '}
            JNTUH or any government body. Question sets are compiled for study purposes; errors may exist,
            so treat this as a supplement to textbooks, notes, and classroom teaching — not a replacement
            for official university materials.
          </p>
        </section>

        <p className="mt-10 text-sm text-slate-500 dark:text-slate-500">
          Questions about using the site? See the{' '}
          <Link to="/help" className="font-medium text-sky-600 underline decoration-sky-600/30 underline-offset-2 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
            Help center
          </Link>
          .
        </p>
      </div>
    </>
  )
}
