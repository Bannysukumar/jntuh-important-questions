import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { adminListFeedback, adminSetFeedbackStatus } from '@/services/feedbackApi'
import type { FeedbackStatus } from '@/types/models'

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function AdminFeedbackPage() {
  const qc = useQueryClient()
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['admin', 'feedback'],
    queryFn: () => adminListFeedback(300),
  })

  const mut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) => adminSetFeedbackStatus(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'feedback'] }),
  })

  const newCount = items.filter((f) => f.status === 'new').length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Feedback"
        description={`Suggestions and messages from the Help center. ${newCount ? `${newCount} new.` : 'No new items.'}`}
      />

      {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {isError ? (
        <p className="text-sm text-rose-400">Could not load feedback. Check Firestore rules and deploy.</p>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-slate-400">
          No submissions yet. They appear when students use Help → Suggestion / Feedback.
        </div>
      ) : null}

      <ul className="space-y-4">
        {items.map((f) => (
          <li
            key={f.id}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 shadow-inner shadow-black/20"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs text-slate-500">{formatDate(f.createdAt)}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{f.message}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-slate-500">
                  {f.authorUid ? <span>UID: {f.authorUid}</span> : <span>Guest</span>}
                  {f.authorName ? <span>Name: {f.authorName}</span> : null}
                  {f.contactEmail ? (
                    <a href={`mailto:${f.contactEmail}`} className="text-cyan-400 hover:underline">
                      {f.contactEmail}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <span
                  className={`rounded-lg px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wider ${
                    f.status === 'new'
                      ? 'bg-amber-500/20 text-amber-200'
                      : f.status === 'read'
                        ? 'bg-slate-500/20 text-slate-300'
                        : 'bg-slate-600/30 text-slate-400'
                  }`}
                >
                  {f.status}
                </span>
                <div className="flex gap-1">
                  {f.status !== 'read' ? (
                    <button
                      type="button"
                      onClick={() => mut.mutate({ id: f.id, status: 'read' })}
                      className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
                    >
                      Mark read
                    </button>
                  ) : null}
                  {f.status !== 'archived' ? (
                    <button
                      type="button"
                      onClick={() => mut.mutate({ id: f.id, status: 'archived' })}
                      className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => mut.mutate({ id: f.id, status: 'new' })}
                      className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
