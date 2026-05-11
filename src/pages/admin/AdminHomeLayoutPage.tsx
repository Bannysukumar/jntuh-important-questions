import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { questionSetPublicPath } from '@/lib/adminPaths'
import { BRANCHES } from '@/lib/constants'
import { fetchAdminSiteConfig, saveAdminSiteConfig } from '@/services/adminApi'
import {
  adminListAllQuestionSets,
  adminPatchQuestionSet,
  type AdminQuestionPatch,
} from '@/services/questionsApi'
import type { QuestionSet } from '@/types/models'

const ALL_BRANCH_IDS = BRANCHES.map((b) => b.id)

export function AdminHomeLayoutPage() {
  const qc = useQueryClient()
  const { data: config, isLoading: cfgLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'siteConfig'],
    queryFn: fetchAdminSiteConfig,
  })

  const [branchSelection, setBranchSelection] = useState<string[]>([])

  useEffect(() => {
    if (!config) return
    const next =
      config.homeBranchIds.length === 0
        ? [...ALL_BRANCH_IDS]
        : ALL_BRANCH_IDS.filter((id) => config.homeBranchIds.includes(id))
    queueMicrotask(() => setBranchSelection(next))
  }, [config, dataUpdatedAt])

  const saveBranches = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!config) throw new Error('Config not loaded')
      const normalized = ids.length === ALL_BRANCH_IDS.length ? [] : ids
      await saveAdminSiteConfig({ ...config, homeBranchIds: normalized })
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'siteConfig'] })
      void qc.invalidateQueries({ queryKey: ['publicHomeSettings'] })
    },
  })

  const { data: sets = [], isLoading: setsLoading } = useQuery({
    queryKey: ['admin', 'questionSets'],
    queryFn: () => adminListAllQuestionSets(),
  })

  const published = useMemo(
    () => sets.filter((s) => s.status === 'published').sort((a, b) => a.branch.localeCompare(b.branch) || a.title.localeCompare(b.title)),
    [sets],
  )

  const patchMut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: AdminQuestionPatch }) => adminPatchQuestionSet(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      void qc.invalidateQueries({ queryKey: ['homePublishedCatalog'] })
      void qc.invalidateQueries({ queryKey: ['featured'] })
    },
  })

  const toggleBranch = (id: string) => {
    setBranchSelection((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return [...ALL_BRANCH_IDS]
        return prev.filter((x) => x !== id)
      }
      return [...prev, id].sort()
    })
  }

  if (cfgLoading || !config) {
    return <p className="text-slate-500">Loading…</p>
  }

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Home page layout"
        description="Choose which branches appear in Browse by branch. For each published unit, toggle whether it appears on home, and mark Popular / Important for the top section."
      />

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Branches on home</h2>
        <p className="mt-1 text-sm text-slate-400">
          All selected = same as “show every branch”. Uncheck branches you want to hide from the home grid.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {BRANCHES.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 hover:border-cyan-500/40"
            >
              <input
                type="checkbox"
                checked={branchSelection.includes(b.id)}
                onChange={() => toggleBranch(b.id)}
                className="rounded border-white/20 bg-slate-950 text-cyan-500"
              />
              {b.label}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saveBranches.isPending}
            onClick={() => saveBranches.mutate(branchSelection)}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saveBranches.isPending ? 'Saving…' : 'Save branch layout'}
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            onClick={() => setBranchSelection([...ALL_BRANCH_IDS])}
          >
            Select all branches
          </button>
        </div>
        {saveBranches.isSuccess ? (
          <p className="mt-3 text-sm text-emerald-300">Branch layout saved.</p>
        ) : null}
        {saveBranches.isError ? (
          <p className="mt-3 text-sm text-red-300">Save failed. Check Firestore rules for siteConfig.</p>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-white">Published units on home</h2>
        <p className="mt-1 text-sm text-slate-400">
          <strong>On home</strong> controls the branch section. <strong>Important</strong> and <strong>Popular</strong> drive the top “Top picks” strip (Important listed first).
        </p>
        {setsLoading ? (
          <p className="mt-4 text-slate-500">Loading question sets…</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3 font-semibold">Unit</th>
                    <th className="px-3 py-3 font-semibold">On home</th>
                    <th className="px-3 py-3 font-semibold">Important</th>
                    <th className="px-3 py-3 font-semibold">Popular</th>
                    <th className="px-3 py-3 font-semibold">Featured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {published.map((row) => (
                    <HomeRow
                      key={row.id}
                      row={row}
                      busy={patchMut.isPending}
                      onPatch={(patch) => patchMut.mutate({ id: row.id, patch })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {published.length === 0 ? (
              <p className="p-6 text-center text-slate-500">No published sets yet.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  )
}

function HomeRow({
  row,
  onPatch,
  busy,
}: {
  row: QuestionSet
  onPatch: (p: AdminQuestionPatch) => void
  busy: boolean
}) {
  const path = questionSetPublicPath(row)
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="max-w-[320px] px-3 py-3">
        <p className="font-medium text-slate-100">{row.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {row.branch.toUpperCase()} · {row.subjectCode}
        </p>
        <code className="mt-1 block truncate text-[10px] text-slate-600">{path}</code>
      </td>
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={row.showOnHome}
          disabled={busy}
          onChange={(e) => onPatch({ showOnHome: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-cyan-500"
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={row.important}
          disabled={busy}
          onChange={(e) => onPatch({ important: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-amber-500"
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={row.popular}
          disabled={busy}
          onChange={(e) => onPatch({ popular: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-violet-500"
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={row.featured}
          disabled={busy}
          onChange={(e) => onPatch({ featured: e.target.checked })}
          className="rounded border-white/20 bg-slate-950 text-sky-500"
        />
      </td>
    </tr>
  )
}
