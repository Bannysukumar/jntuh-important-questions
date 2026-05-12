import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useRegulations } from '@/hooks/useRegulations'
import { DEFAULT_REGULATIONS } from '@/lib/constants'
import {
  adminBulkDeleteByBranchRow,
  adminBulkPatchByBranchRow,
  adminCloneBranchRow,
  fetchBranchAggregates,
  type BranchAggregateRow,
} from '@/services/adminApi'
import type { RegulationId } from '@/types/models'

const DEFAULT_REG_ID = (DEFAULT_REGULATIONS.find((x) => x.id === 'r22') ?? DEFAULT_REGULATIONS[0])!.id as RegulationId

export function AdminBranchesPage() {
  const qc = useQueryClient()
  const { regulations } = useRegulations()
  const [editRow, setEditRow] = useState<BranchAggregateRow | null>(null)
  const [form, setForm] = useState({ branch: '', regulation: DEFAULT_REG_ID })
  const [cloneRow, setCloneRow] = useState<BranchAggregateRow | null>(null)
  const [cloneForm, setCloneForm] = useState({ branch: '', regulation: DEFAULT_REG_ID })

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

  const cloneMut = useMutation({
    mutationFn: () => {
      if (!cloneRow) return Promise.resolve(0)
      const branch = cloneForm.branch.trim()
      return adminCloneBranchRow(cloneRow, {
        branch,
        regulation: cloneForm.regulation,
      })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'branches'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setCloneRow(null)
    },
  })

  function openEdit(row: BranchAggregateRow) {
    setForm({
      branch: row.branch,
      regulation: row.regulation as RegulationId,
    })
    setEditRow(row)
  }

  function openClone(row: BranchAggregateRow) {
    setCloneForm({
      branch: '',
      regulation: row.regulation as RegulationId,
    })
    setCloneRow(row)
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
                          onClick={() => openClone(r)}
                          className="rounded-lg border border-violet-500/40 px-2 py-1 text-xs text-violet-300 hover:bg-violet-500/10"
                        >
                          Clone set
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
              {regulations.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          {patchMut.isError ? (
            <p className="mt-3 text-sm text-red-300">Update failed. Check permissions.</p>
          ) : null}
        </AdminModal>
      ) : null}

      {cloneRow ? (
        <AdminModal
          title="Clone branch group"
          onClose={() => setCloneRow(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setCloneRow(null)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={cloneMut.isPending || !cloneForm.branch.trim()}
                onClick={() => void cloneMut.mutate()}
                className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {cloneMut.isPending ? 'Cloning…' : 'Clone all units'}
              </button>
            </>
          }
        >
          <p className="mb-3 text-xs text-slate-500">
            Creates {cloneRow.questionSetCount} new question set(s) copied from{' '}
            <span className="font-medium text-slate-300">
              {cloneRow.regulation.toUpperCase()} / {cloneRow.branch.toUpperCase()}
            </span>
            . Pick the branch (and regulation if needed) for every duplicated unit in one step. View and
            download counts start at zero on the copies.
          </p>
          <label className="block">
            <span className="text-xs text-slate-500">Target branch code (e.g. ece)</span>
            <input
              value={cloneForm.branch}
              onChange={(e) => setCloneForm((f) => ({ ...f, branch: e.target.value }))}
              placeholder="Must differ from source unless regulation differs"
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-xs text-slate-500">Regulation for cloned sets</span>
            <select
              value={cloneForm.regulation}
              onChange={(e) =>
                setCloneForm((f) => ({ ...f, regulation: e.target.value as RegulationId }))
              }
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              {regulations.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.label}
                </option>
              ))}
            </select>
          </label>
          {cloneMut.isError ? (
            <p className="mt-3 text-sm text-red-300">
              {(cloneMut.error as Error)?.message ??
                'Clone failed. Check permissions or choose a different branch/regulation.'}
            </p>
          ) : null}
        </AdminModal>
      ) : null}
    </div>
  )
}
