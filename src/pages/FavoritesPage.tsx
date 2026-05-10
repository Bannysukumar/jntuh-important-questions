import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { getLocalFavoriteQuestionIds } from '@/lib/favoritesLocal'
import { slugify, unitSegment } from '@/lib/slug'
import { fetchQuestionById } from '@/services/questionsApi'

export function FavoritesPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['favorites-local'],
    queryFn: async () => {
      const ids = getLocalFavoriteQuestionIds()
      const rows = await Promise.all(ids.map((id) => fetchQuestionById(id)))
      return rows.flatMap((r) => (r ? [r] : []))
    },
  })

  return (
    <>
      <SEOHead
        title="Saved favorites"
        description="Your saved JNTUH important question sets."
        canonicalPath="/favorites"
        noindex
      />
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Favorites</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Stored locally on this device. Sign in to sync across devices (Firestore `favorites`
        collection — wire in production).
      </p>
      {isLoading ? <p className="mt-4 text-slate-500">Loading…</p> : null}
      <ul className="mt-6 space-y-3">
        {items.map((q) =>
          q ? (
            <li
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <Link
                className="font-semibold text-brand-700 hover:underline dark:text-sky-400"
                to={`/${q.regulation}/${q.branch}/${q.semester}/${slugify(q.subjectName)}/${unitSegment(q.unitNumber)}`}
              >
                {q.title}
              </Link>
            </li>
          ) : null,
        )}
        {!isLoading && items.length === 0 ? (
          <li className="text-slate-500">No favorites yet. Save from any question page.</li>
        ) : null}
      </ul>
    </>
  )
}
