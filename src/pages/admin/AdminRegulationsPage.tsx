import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { DEFAULT_REGULATIONS } from '@/lib/constants'
import { fetchAdminSiteConfig, saveAdminSiteConfig } from '@/services/adminApi'
import type { AdminSiteConfig, RegulationEntry } from '@/types/models'

function normalizeId(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '')
}

function isValidRegId(id: string): boolean {
  return /^r[a-z0-9]{1,15}$/.test(id)
}

export function AdminRegulationsPage() {
  const qc = useQueryClient()
  const { data: config, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'siteConfig'],
    queryFn: fetchAdminSiteConfig,
  })

  const [rows, setRows] = useState<RegulationEntry[]>([])
  const [newId, setNewId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!config) return
    const next = config.regulations.map((r) => ({ ...r }))
    queueMicrotask(() => setRows(next))
  }, [config, dataUpdatedAt])

  const save = useMutation({
    mutationFn: async (next: RegulationEntry[]) => {
      if (!config) throw new Error('Not loaded')
      const payload: AdminSiteConfig = { ...config, regulations: next }
      await saveAdminSiteConfig(payload)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'siteConfig'] })
      void qc.invalidateQueries({ queryKey: ['publicRegulations'] })
    },
  })

  const persist = (next: RegulationEntry[]) => {
    setFormError('')
    if (next.length === 0) {
      setFormError('Keep at least one regulation.')
      return
    }
    const ids = new Set<string>()
    for (const r of next) {
      if (ids.has(r.id)) {
        setFormError(`Duplicate id: ${r.id}`)
        return
      }
      ids.add(r.id)
    }
    save.mutate(next)
  }

  const addRow = () => {
    const id = normalizeId(newId)
    const label = newLabel.trim()
    if (!id || !label) {
      setFormError('Enter both id (e.g. r25) and label (e.g. R25).')
      return
    }
    if (!isValidRegId(id)) {
      setFormError('Id must look like r18, r22, r25 — start with “r”, then letters/numbers only (max 16 chars).')
      return
    }
    if (rows.some((r) => r.id === id)) {
      setFormError('That id already exists.')
      return
    }
    const next = [...rows, { id, label }]
    setRows(next)
    persist(next)
    setNewId('')
    setNewLabel('')
  }

  const removeAt = (index: number) => {
    const next = rows.filter((_, i) => i !== index)
    setRows(next)
    persist(next)
  }

  const updateLabel = (index: number, label: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, label } : r)))
  }

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= rows.length) return
    const next = [...rows]
    ;[next[index], next[j]] = [next[j], next[index]]
    setRows(next)
    persist(next)
  }

  const resetDefaults = () => {
    persist(DEFAULT_REGULATIONS.map((r) => ({ ...r })))
  }

  if (isLoading || !config) {
    return <p className="text-slate-500">Loading…</p>
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Regulations"
        description="Controls the regulation dropdown in search, question editor, and branch/subject tools. Ids are lowercase URL segments (r18, r22, r25). Save after each change."
      />

      {save.isSuccess ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Regulations saved to site config.
        </p>
      ) : null}
      {save.isError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          Save failed. Check Firestore rules for siteConfig.
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">{formError}</p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Id (URL)</th>
              <th className="px-4 py-3 font-semibold">Label</th>
              <th className="px-4 py-3 font-semibold">Preview path</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r, i) => (
              <tr key={r.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={save.isPending || i === 0}
                      onClick={() => move(i, -1)}
                      className="rounded border border-white/15 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={save.isPending || i === rows.length - 1}
                      onClick={() => move(i, 1)}
                      className="rounded border border-white/15 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-cyan-300">{r.id}</td>
                <td className="px-4 py-3">
                  <input
                    value={r.label}
                    disabled={save.isPending}
                    onChange={(e) => updateLabel(i, e.target.value)}
                    className="w-full min-w-[100px] rounded-lg border border-white/15 bg-slate-950 px-2 py-1.5 text-white focus:border-cyan-500/50 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  <code className="break-all">
                    /{r.id}/ece/2-1/…
                  </code>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={save.isPending || rows.length <= 1}
                    onClick={() => removeAt(i)}
                    className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-30"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Add regulation</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs text-slate-500">Id</span>
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="r25"
              className="mt-1 w-32 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Label</span>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="R25"
              className="mt-1 w-40 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <button
            type="button"
            disabled={save.isPending}
            onClick={addRow}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => persist(rows.map((r) => ({ ...r, label: r.label.trim() })))}
          className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
        >
          Save label edits
        </button>
        <button
          type="button"
          disabled={save.isPending}
          onClick={resetDefaults}
          className="rounded-xl border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/10"
        >
          Reset to R18 / R22 / R24 defaults
        </button>
      </div>
    </div>
  )
}
