import { useQuery } from '@tanstack/react-query'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatCard } from '@/components/admin/StatCard'
import { fetchAdminDashboardStats } from '@/services/adminApi'

export function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminDashboardStats,
  })

  if (isLoading || !data) {
    return <p className="text-slate-500">Loading analytics…</p>
  }

  const maxViews = Math.max(...data.topByViews.map((q) => q.viewCount), 1)

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Engagement totals from Firestore counters on question sets. For deeper funnels, export backups and connect BigQuery or Cloud Functions."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Views (all time)" value={data.totalViews.toLocaleString()} accent="violet" />
        <StatCard label="Downloads" value={data.totalDownloads.toLocaleString()} accent="amber" />
        <StatCard label="Shares" value={data.totalShares.toLocaleString()} accent="cyan" />
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Views by top unit</h2>
        <p className="mt-1 text-sm text-slate-500">Relative bar length vs. highest unit in the list.</p>
        <ul className="mt-6 space-y-4">
          {data.topByViews.map((q) => {
            const pct = Math.round((q.viewCount / maxViews) * 100)
            return (
              <li key={q.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-200">
                    {q.subjectName} · Unit {q.unitNumber}{' '}
                    <span className="text-slate-500">
                      ({q.regulation.toUpperCase()} {q.branch.toUpperCase()})
                    </span>
                  </span>
                  <span className="tabular-nums text-cyan-400">{q.viewCount.toLocaleString()}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
