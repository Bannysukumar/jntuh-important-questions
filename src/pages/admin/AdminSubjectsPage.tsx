import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useRegulations } from '@/hooks/useRegulations'
import { DEFAULT_REGULATIONS } from '@/lib/constants'
import {
  adminBulkDeleteBySubjectRow,
  adminBulkPatchBySubjectRow,
  fetchSubjectAggregates,
  type SubjectAggregateRow,
} from '@/services/adminApi'
import type { RegulationId } from '@/types/models'

const DEFAULT_REG_ID = (DEFAULT_REGULATIONS.find((x) => x.id === 'r22') ?? DEFAULT_REGULATIONS[0])!.id as RegulationId

export function AdminSubjectsPage() {
  const qc = useQueryClient()
  const { regulations } = useRegulations()
  const [editRow, setEditRow] = useState<SubjectAggregateRow | null>(null)
  const [form, setForm] = useState({
    subjectName: '',
    subjectCode: '',
    semester: '',
    branch: '',
    regulation: DEFAULT_REG_ID,
  })

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: fetchSubjectAggregates,
  })

  const patchMut = useMutation({
    mutationFn: () => {
      if (!editRow) return Promise.resolve(0)
      return adminBulkPatchBySubjectRow(editRow, {
        subjectName: form.subjectName.trim() || undefined,
        subjectCode: form.subjectCode.trim() || undefined,
        semester: form.semester.trim() || undefined,
        branch: form.branch.trim() || undefined,
        regulation: form.regulation,
      })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'branches'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setEditRow(null)
    },
  })

  const delMut = useMutation({
    mutationFn: (row: SubjectAggregateRow) => adminBulkDeleteBySubjectRow(row),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'subjects'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'branches'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  function openEdit(row: SubjectAggregateRow) {
    setForm({
      subjectName: row.subjectName,
      subjectCode: row.subjectCode,
      semester: row.semester,
      branch: row.branch,
      regulation: row.regulation as RegulationId,
    })
    setEditRow(row)
  }

  const newUnitHref = (r: SubjectAggregateRow) =>
    `/admin/questions/new?regulation=${encodeURIComponent(r.regulation)}&branch=${encodeURIComponent(r.branch)}&semester=${encodeURIComponent(r.semester)}&subjectName=${encodeURIComponent(r.subjectName)}&subjectCode=${encodeURIComponent(r.subjectCode)}`

  return (
    <div>
      <AdminPageHeader
        title="Subjects"
        description="Each row groups all unit documents for one subject (regulation · branch · semester · code). Edit updates every matching question set; delete removes all units for that subject."
        actions={
          <Link
            to="/admin/questions/new"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + New subject / unit
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Regulation</th>
                  <th className="px-4 py-3 font-semibold">Branch</th>
                  <th className="px-4 py-3 font-semibold">Semester</th>
                  <th className="px-4 py-3 font-semibold tabular-nums">Units</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => (
                  <tr key={r.key} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-slate-100">{r.subjectName}</td>
                    <td className="px-4 py-3 text-slate-400">{r.subjectCode}</td>
                    <td className="px-4 py-3 uppercase text-slate-400">{r.regulation}</td>
                    <td className="px-4 py-3 uppercase text-slate-400">{r.branch}</td>
                    <td className="px-4 py-3 text-slate-400">{r.semester}</td>
                    <td className="px-4 py-3 tabular-nums text-cyan-400">{r.unitCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          to={newUnitHref(r)}
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
                                `Delete ALL ${r.unitCount} unit(s) for ${r.subjectName} (${r.subjectCode})? This cannot be undone.`,
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
          title="Update subject (all units)"
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
                {patchMut.isPending ? 'Saving…' : 'Save to all units'}
              </button>
            </>
          }
        >
          <p className="mb-3 text-xs text-slate-500">
            Applies to {editRow.unitCount} document(s) matching this subject key.
          </p>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-slate-500">Subject name</span>
              <input
                value={form.subjectName}
                onChange={(e) => setForm((f) => ({ ...f, subjectName: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Subject code</span>
              <input
                value={form.subjectCode}
                onChange={(e) => setForm((f) => ({ ...f, subjectCode: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Semester</span>
              <input
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Branch code</span>
              <input
                value={form.branch}
                onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block">
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
          </div>
          {patchMut.isError ? (
            <p className="mt-3 text-sm text-red-300">
              {patchMut.error instanceof Error
                ? patchMut.error.message
                : 'Update failed. If rules block writes, ensure your account is admin in Firestore.'}
            </p>
          ) : null}
        </AdminModal>
      ) : null}
    </div>
  )
}
