import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatCard } from '@/components/admin/StatCard'
import { questionSetPublicPath } from '@/lib/adminPaths'
import { fetchAdminDashboardStats } from '@/services/adminApi'

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 rounded-lg bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Could not load dashboard stats. Check Firestore rules and network.
      </p>
    )
  }

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Live counts from Firestore (or demo data when Firebase env is missing). Use the sidebar to manage content."
        actions={
          <Link
            to="/admin/questions"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110"
          >
            Manage questions
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Question sets" value={data.totalQuestionSets} hint={`${data.published} published`} />
        <StatCard
          label="Total views"
          value={data.totalViews.toLocaleString()}
          accent="violet"
          hint="Across all units"
        />
        <StatCard
          label="Downloads"
          value={data.totalDownloads.toLocaleString()}
          accent="amber"
          hint="PDF + share actions"
        />
        <StatCard label="Comments" value={data.totalComments} accent="emerald" hint={`${data.totalUsers} users`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur">
          <h2 className="font-display text-lg font-semibold text-white">Publishing</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Published</span>
              <span className="font-medium text-emerald-400">{data.published}</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Draft</span>
              <span className="font-medium text-amber-400">{data.draft}</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Archived</span>
              <span className="font-medium text-slate-400">{data.archived}</span>
            </li>
            <li className="flex justify-between pt-1">
              <span className="text-slate-400">Featured sets</span>
              <span className="font-medium text-cyan-400">{data.featuredCount}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur">
          <h2 className="font-display text-lg font-semibold text-white">Top units by views</h2>
          <ol className="mt-4 space-y-3">
            {data.topByViews.map((q, i) => (
              <li key={q.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="text-slate-500">{i + 1}.</span>{' '}
                  <span className="font-medium text-slate-200">{q.subjectName}</span>
                  <span className="text-slate-500">
                    {' '}
                    · {q.regulation.toUpperCase()} {q.branch.toUpperCase()} · Unit {q.unitNumber}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="tabular-nums text-cyan-400">{q.viewCount.toLocaleString()}</span>
                  <Link
                    to={questionSetPublicPath(q)}
                    className="ml-2 text-xs font-medium text-slate-500 underline hover:text-cyan-400"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
