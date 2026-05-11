import { Link, Navigate, useParams } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { JsonLdArticle, JsonLdBreadcrumb, JsonLdFAQPage } from '@/components/seo/JsonLd'
import { getBlogPost, listBlogPosts } from '@/lib/blogPosts'

export function BlogPostPage() {
  const { slug } = useParams()
  const post = slug ? getBlogPost(slug) : undefined

  if (!slug || !post) {
    return <Navigate to="/blog" replace />
  }

  const canonicalPath = `/blog/${post.slug}`
  const related = post.relatedSlugs
    .map((s) => getBlogPost(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <>
      <SEOHead
        title={post.seoTitle}
        description={post.description}
        canonicalPath={canonicalPath}
        ogType="article"
        keywords={post.keywords}
        articlePublishedTime={`${post.datePublished}T08:00:00+05:30`}
        articleModifiedTime={`${post.dateModified}T08:00:00+05:30`}
      />
      <JsonLdBreadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: canonicalPath },
        ]}
      />
      <JsonLdArticle
        title={post.title}
        description={post.description}
        path={canonicalPath}
        datePublished={`${post.datePublished}T08:00:00+05:30`}
        dateModified={`${post.dateModified}T08:00:00+05:30`}
      />
      <JsonLdFAQPage faqs={post.faqs} />

      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">Blog</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Last updated{' '}
          <time dateTime={post.dateModified}>{post.dateModified}</time>
          {' · '}
          First published <time dateTime={post.datePublished}>{post.datePublished}</time>
        </p>
        <p className="mt-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300">{post.description}</p>

        <nav
          aria-label="Table of contents"
          className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/40"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            On this page
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm font-medium text-sky-700 dark:text-sky-400">
            {post.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#faq" className="hover:underline">
                FAQ
              </a>
            </li>
          </ol>
        </nav>

        <div className="prose prose-slate mt-10 max-w-none dark:prose-invert">
          {post.sections.map((s) => (
            <section key={s.id} id={s.id} className="mt-12 scroll-mt-24">
              <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{s.title}</h2>
              {s.paragraphs.map((para, i) => (
                <p key={i} className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        <section id="faq" className="mt-14 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Frequently asked questions</h2>
          <dl className="mt-4 space-y-5">
            {post.faqs.map((f) => (
              <div key={f.question}>
                <dt className="font-medium text-slate-900 dark:text-white">{f.question}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 rounded-2xl border border-sky-200/80 bg-sky-50/50 p-6 dark:border-sky-900/40 dark:bg-sky-950/20">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Related links</h2>
          <ul className="mt-3 space-y-2 text-sm text-sky-800 dark:text-sky-200">
            <li>
              <Link to="/search" className="font-medium hover:underline">
                Start preparing — browse JNTUH important questions
              </Link>
            </li>
            <li>
              <Link to="/ratings" className="font-medium hover:underline">
                Rate your exam experience after the paper
              </Link>
            </li>
            <li>
              <Link to="/about" className="font-medium hover:underline">
                About us — accuracy, updates, and how we predict questions
              </Link>
            </li>
            {related.map((r) => (
              <li key={r.slug}>
                <Link to={`/blog/${r.slug}`} className="font-medium hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            More articles
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {listBlogPosts()
              .filter((p) => p.slug !== post.slug)
              .map((p) => (
                <li key={p.slug}>
                  <Link to={`/blog/${p.slug}`} className="text-sky-700 hover:underline dark:text-sky-400">
                    {p.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </article>
    </>
  )
}
