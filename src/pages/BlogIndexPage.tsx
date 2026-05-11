import { Link } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { JsonLdBreadcrumb } from '@/components/seo/JsonLd'
import { SITE_NAME } from '@/lib/constants'
import { listBlogPosts } from '@/lib/blogPosts'
import { GLOBAL_SEO_KEYWORDS } from '@/lib/seoKeywords'

const PAGE_TITLE = 'JNTUH exam prep blog — guides & important Q tips'
const PAGE_DESC =
  'SEO-friendly guides for JNTUH students: how to pass exams, R22 important questions, last-minute prep, and repeated-question patterns. Links to free unit-wise PDFs and browse.'

export function BlogIndexPage() {
  const posts = listBlogPosts()

  return (
    <>
      <SEOHead
        title={PAGE_TITLE}
        description={PAGE_DESC}
        canonicalPath="/blog"
        keywords={[...GLOBAL_SEO_KEYWORDS, 'JNTUH blog', 'JNTUH exam preparation tips']}
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">Blog</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {SITE_NAME} — exam prep articles
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">{PAGE_DESC}</p>

        <ul className="mt-10 space-y-6">
          {posts.map((p) => (
            <li key={p.slug}>
              <article className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-sky-200 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-sky-500/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Updated {p.dateModified} · Published {p.datePublished}
                </p>
                <h2 className="mt-2 font-display text-xl font-semibold text-slate-900 dark:text-white">
                  <Link to={`/blog/${p.slug}`} className="text-sky-700 hover:underline dark:text-sky-400">
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link
                    to={`/blog/${p.slug}`}
                    className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
                  >
                    Read article →
                  </Link>
                  <Link to="/search" className="font-medium text-slate-600 hover:underline dark:text-slate-400">
                    Browse important questions
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
