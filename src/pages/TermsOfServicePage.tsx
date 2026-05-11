import { Link } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { SITE_NAME } from '@/lib/constants'

export function TermsOfServicePage() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description={`Terms of service — ${SITE_NAME}: free JNTUH important questions, PDFs, comments, and ratings.`}
        canonicalPath="/terms"
        keywords={['terms of service', 'JNTUH', SITE_NAME]}
      />
      <article className="mx-auto max-w-3xl space-y-4 text-slate-700 dark:text-slate-300">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-slate-500">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        <p className="leading-relaxed">
          By accessing or using {SITE_NAME}, you agree to these terms. If you do not agree, do not use the service.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">Educational use</h2>
        <p className="leading-relaxed">
          Content is provided for educational and revision purposes. You are responsible for complying with your
          institution’s academic integrity rules.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">Accuracy</h2>
        <p className="leading-relaxed">
          Question sets and PDFs may contain errors or omissions. Content is not guaranteed to match current syllabus or
          examination patterns. Always verify with official sources and faculty.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">Accounts</h2>
        <p className="leading-relaxed">
          You are responsible for safeguarding access to your account and for activity conducted through your account.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">Acceptable use</h2>
        <p className="leading-relaxed">
          Do not abuse the service (including spam, scraping that degrades performance, or unlawful activity). We may
          suspend access for violations.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Intellectual property
        </h2>
        <p className="leading-relaxed">
          Site branding, layout, and original compilations are protected. Third-party materials remain property of their
          respective owners; our use is believed to be fair educational use — concerns should be raised via contact
          channels.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">Disclaimer</h2>
        <p className="leading-relaxed">
          See also our{' '}
          <Link to="/disclaimer" className="text-sky-600 hover:underline dark:text-sky-400">
            Disclaimer
          </Link>
          .
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">Changes</h2>
        <p className="leading-relaxed">We may modify these terms; continued use after updates constitutes acceptance.</p>
      </article>
    </>
  )
}
