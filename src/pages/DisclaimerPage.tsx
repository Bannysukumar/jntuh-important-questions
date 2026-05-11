import { SEOHead } from '@/components/seo/SEOHead'
import { SITE_NAME } from '@/lib/constants'

export function DisclaimerPage() {
  return (
    <>
      <SEOHead
        title="Disclaimer"
        description={`Disclaimer — ${SITE_NAME}: free independent JNTUH B.Tech important questions from paper analysis; not affiliated with JNTUH.`}
        canonicalPath="/disclaimer"
        keywords={['JNTUH disclaimer', 'educational resource', SITE_NAME]}
      />
      <article className="mx-auto max-w-3xl space-y-4 text-slate-700 dark:text-slate-300">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Disclaimer</h1>
        <p className="text-sm text-slate-500">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        <p className="leading-relaxed">
          <strong>{SITE_NAME}</strong> is an independent educational project. It is{' '}
          <strong>not affiliated with, endorsed by, or sponsored by</strong> Jawaharlal Nehru Technological University
          Hyderabad (JNTUH), any university, or government body unless explicitly stated.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          No guarantee of accuracy
        </h2>
        <p className="leading-relaxed">
          Important questions, PDFs, and explanations are compiled from various sources and community contributions.
          Errors may exist. Content may not reflect the latest syllabus or examination blueprint.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Not official examination material
        </h2>
        <p className="leading-relaxed">
          Nothing on this site constitutes official university communication, question papers, or grading guidance. For
          authoritative information, refer to JNTUH portals, notices, and your faculty.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Use at your own risk
        </h2>
        <p className="leading-relaxed">
          You use materials at your own discretion. We are not liable for academic outcomes, damages, or losses arising
          from reliance on this site, to the fullest extent permitted by law.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Third-party links
        </h2>
        <p className="leading-relaxed">
          External links are provided for convenience; we do not control third-party content or policies.
        </p>
      </article>
    </>
  )
}
