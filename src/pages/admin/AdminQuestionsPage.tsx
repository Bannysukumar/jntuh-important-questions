import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { questionSetPublicPath } from '@/lib/adminPaths'
import {
  adminDeleteQuestionSet,
  adminListAllQuestionSets,
  adminPatchQuestionSet,
  type AdminQuestionPatch,
} from '@/services/questionsApi'
import type { QuestionSet, QuestionStatus } from '@/types/models'

const STATUS_OPTIONS: QuestionStatus[] = ['published', 'draft', 'archived']

export function AdminQuestionsPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')

  const { data: sets = [], isLoading } = useQuery({
    queryKey: ['admin', 'questionSets'],
    queryFn: () => adminListAllQuestionSets(),
  })

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return sets
    return sets.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        s.subjectName.toLowerCase().includes(t) ||
        s.subjectCode.toLowerCase().includes(t) ||
        s.id.toLowerCase().includes(t),
    )
  }, [sets, q])

  const patchMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AdminQuestionPatch }) =>
      adminPatchQuestionSet(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['homePublishedCatalog'] })
      void qc.invalidateQueries({ queryKey: ['featured'] })
    },
  })

  const delMut = useMutation({
    mutationFn: adminDeleteQuestionSet,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      void qc.invalidateQueries({ queryKey: ['homePublishedCatalog'] })
      void qc.invalidateQueries({ queryKey: ['featured'] })
    },
  })

  return (
    <div>
      <AdminPageHeader
        title="Question sets"
        description="Create units, edit full content, change publish status, or remove sets. Demo mode uses in-memory sample data."
        actions={
          <>
            <Link
              to="/admin/questions/new"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25"
            >
              + New question set
            </Link>
            <input
              type="search"
              placeholder="Search title, subject, code, id…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full min-w-[200px] rounded-xl border border-white/15 bg-slate-900/80 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 sm:w-72"
            />
          </>
        }
      />

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Route</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Home</th>
                  <th className="px-4 py-3 font-semibold">Imp.</th>
                  <th className="px-4 py-3 font-semibold">Pop.</th>
                  <th className="px-4 py-3 font-semibold">Feat.</th>
                  <th className="px-4 py-3 font-semibold tabular-nums">Views</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((row) => (
                  <QuestionRow
                    key={row.id}
                    row={row}
                    onPatch={(patch) => patchMut.mutate({ id: row.id, patch })}
                    onDelete={() => {
                      if (window.confirm(`Delete “${row.title}”? This cannot be undone.`)) {
                        delMut.mutate(row.id)
                      }
                    }}
                    busy={patchMut.isPending || delMut.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No question sets match your search.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

function QuestionRow({
  row,
  onPatch,
  onDelete,
  busy,
}: {
  row: QuestionSet
  onPatch: (p: AdminQuestionPatch) => void
  onDelete: () => void
  busy: boolean
}) {
  const publicPath = questionSetPublicPath(row)
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="max-w-[280px] px-4 py-3">
        <p className="font-medium text-slate-100">{row.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {row.subjectCode} · {row.id}
        </p>
      </td>
      <td className="px-4 py-3">
        <code className="break-all text-xs text-slate-400">{publicPath}</code>
      </td>
      <td className="px-4 py-3">
        <select
          value={row.status}
          disabled={busy}
          onChange={(e) => onPatch({ status: e.target.value as QuestionStatus })}
          className="rounded-lg border border-white/15 bg-slate-950 px-2 py-1.5 text-xs text-white focus:border-cyan-500/50 focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={row.showOnHome}
          disabled={busy}
          title="Show in Browse by branch on home"
          onChange={(e) => onPatch({ showOnHome: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-cyan-500 focus:ring-cyan-500/40"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={row.important}
          disabled={busy}
          title="Important (top picks)"
          onChange={(e) => onPatch({ important: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-amber-500 focus:ring-amber-500/40"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={row.popular}
          disabled={busy}
          title="Popular (top picks)"
          onChange={(e) => onPatch({ popular: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-violet-500 focus:ring-violet-500/40"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={row.featured}
          disabled={busy}
          title="Featured section"
          onChange={(e) => onPatch({ featured: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-sky-500 focus:ring-cyan-500/40"
        />
      </td>
      <td className="px-4 py-3 tabular-nums text-slate-300">{row.viewCount.toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/questions/${row.id}/edit`}
            className="rounded-lg border border-amber-500/40 px-2 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/10"
          >
            Edit
          </Link>
          <Link
            to={publicPath}
            className="rounded-lg border border-white/15 px-2 py-1 text-xs font-medium text-cyan-400 hover:bg-white/5"
          >
            Open
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="rounded-lg border border-red-500/30 px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
