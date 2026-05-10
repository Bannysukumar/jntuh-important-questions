import { Link } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { SITE_NAME } from '@/lib/constants'

export function PrivacyPolicyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description={`How ${SITE_NAME} collects, uses, and protects information when you use our JNTUH study platform.`}
        canonicalPath="/privacy"
        keywords={['privacy policy', 'JNTUH', 'student data', SITE_NAME]}
      />
      <article className="mx-auto max-w-3xl space-y-4 text-slate-700 dark:text-slate-300">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        <p className="leading-relaxed">
          {SITE_NAME} (“we”, “our”) respects your privacy. This policy describes how we handle information when you use
          our website at our public URL (including deployments such as Vercel).
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Information we collect
        </h2>
        <ul className="list-disc space-y-2 pl-6 leading-relaxed">
          <li>
            <strong>Account data:</strong> If you sign in (e.g. via Firebase Authentication), we process identifiers such
            as email and display name as provided by the auth provider.
          </li>
          <li>
            <strong>Usage data:</strong> We may use analytics (e.g. Google Analytics) to understand traffic, pages
            viewed, and approximate geography — to improve performance and content.
          </li>
          <li>
            <strong>Comments & feedback:</strong> Text you submit may be stored to display on the site or review in
            admin tools.
          </li>
        </ul>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Cookies and similar technologies
        </h2>
        <p className="leading-relaxed">
          We use cookies or local storage for sign-in sessions, theme preference, analytics, and advertising if enabled.
          You can control cookies through your browser settings.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Third-party services
        </h2>
        <p className="leading-relaxed">
          We rely on infrastructure providers (for example hosting, Firebase, and analytics). Their terms apply to data
          they process on our behalf.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">
          Children&apos;s privacy
        </h2>
        <p className="leading-relaxed">
          Our services are intended for students and educators. If you believe we have collected personal information
          from a minor improperly, contact us so we can delete it where required by law.
        </p>
        <h2 className="mt-8 font-display text-xl font-semibold text-slate-900 dark:text-white">Contact</h2>
        <p className="leading-relaxed">
          For privacy requests, use the{' '}
          <Link to="/help" className="text-sky-600 hover:underline dark:text-sky-400">
            Help center
          </Link>{' '}
          feedback option or your posted contact channel for the site operator.
        </p>
        <p className="text-sm text-slate-500">
          This policy may be updated. Continued use after changes constitutes acceptance of the revised policy.
        </p>
      </article>
    </>
  )
}
