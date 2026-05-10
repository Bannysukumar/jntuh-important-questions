import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import {
  adminBulkDeleteByBranchRow,
  adminBulkPatchByBranchRow,
  fetchBranchAggregates,
  type BranchAggregateRow,
} from '@/services/adminApi'
import type { RegulationId } from '@/types/models'

const REGS: RegulationId[] = ['r18', 'r22', 'r24']

export function AdminBranchesPage() {
  const qc = useQueryClient()
  const [editRow, setEditRow] = useState<BranchAggregateRow | null>(null)
  const [form, setForm] = useState({ branch: '', regulation: 'r22' as RegulationId })

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin', 'branches'],
    queryFn: fetchBranchAggregates,
  })

  const patchMut = useMutation({
    mutationFn: () => {
      if (!editRow) return Promise.resolve(0)
      return adminBulkPatchByBranchRow(editRow, {
        branch: form.branch.trim() || undefined,
        regulation: form.regulation,
      })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'branches'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setEditRow(null)
    },
  })

  const delMut = useMutation({
    mutationFn: (row: BranchAggregateRow) => adminBulkDeleteByBranchRow(row),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'branches'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  function openEdit(row: BranchAggregateRow) {
    setForm({
      branch: row.branch,
      regulation: row.regulation as RegulationId,
    })
    setEditRow(row)
  }

  return (
    <div>
      <AdminPageHeader
        title="Branches & regulations"
        description="Rows are derived from question sets. Editing a branch updates regulation/branch code on every document in that group. Delete removes all question sets in that branch (destructive)."
        actions={
          <Link
            to="/admin/questions/new"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + New unit (pick branch in form)
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Regulation</th>
                  <th className="px-4 py-3 font-semibold">Branch</th>
                  <th className="px-4 py-3 font-semibold tabular-nums">Question sets</th>
                  <th className="px-4 py-3 font-semibold tabular-nums">Subject keys</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => (
                  <tr key={`${r.regulation}-${r.branch}`} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium uppercase text-slate-100">{r.regulation}</td>
                    <td className="px-4 py-3 uppercase text-slate-300">{r.branch}</td>
                    <td className="px-4 py-3 tabular-nums text-cyan-400">{r.questionSetCount}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-400">{r.subjectKeys}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          to={`/admin/questions/new?regulation=${encodeURIComponent(r.regulation)}&branch=${encodeURIComponent(r.branch)}`}
                          className="rounded-lg border border-cyan-500/40 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/10"
                        >
                          Add unit
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-lg border border-amber-500/40 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/10"
                        >
                          Edit all
                        </button>
                        <button
                          type="button"
                          disabled={delMut.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete ALL ${r.questionSetCount} question set(s) for ${r.regulation.toUpperCase()} / ${r.branch.toUpperCase()}?`,
                              )
                            ) {
                              delMut.mutate(r)
                            }
                          }}
                          className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Delete all
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editRow ? (
        <AdminModal
          title="Update branch (all question sets)"
          onClose={() => setEditRow(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setEditRow(null)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={patchMut.isPending}
                onClick={() => void patchMut.mutate()}
                className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {patchMut.isPending ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          <p className="mb-3 text-xs text-slate-500">
            Updates {editRow.questionSetCount} document(s) currently under this regulation + branch.
          </p>
          <label className="block">
            <span className="text-xs text-slate-500">Branch code (e.g. ece)</span>
            <input
              value={form.branch}
              onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs text-slate-500">Regulation</span>
            <select
              value={form.regulation}
              onChange={(e) =>
                setForm((f) => ({ ...f, regulation: e.target.value as RegulationId }))
              }
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              {REGS.map((x) => (
                <option key={x} value={x}>
                  {x.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          {patchMut.isError ? (
            <p className="mt-3 text-sm text-red-300">Update failed. Check permissions.</p>
          ) : null}
        </AdminModal>
      ) : null}
    </div>
  )
}
