import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { fetchAdminSiteConfig, saveAdminSiteConfig } from '@/services/adminApi'
import type { AdminSiteConfig } from '@/types/models'

function SettingsForm({ initial }: { initial: AdminSiteConfig }) {
  const qc = useQueryClient()
  const [form, setForm] = useState(initial)

  const save = useMutation({
    mutationFn: saveAdminSiteConfig,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'siteConfig'] })
    },
  })

  return (
    <>
      {save.isSuccess ? (
        <p className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Settings saved.
        </p>
      ) : null}
      {save.isError ? (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          Save failed. Check Firestore rules (`siteConfig`) and try again.
        </p>
      ) : null}

      <div className="max-w-xl space-y-5 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Site name</span>
          <input
            value={form.siteName}
            onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Canonical base URL</span>
          <input
            value={form.baseUrl}
            onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
            placeholder="https://yoursite.com"
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">PDF watermark</span>
          <textarea
            value={form.watermarkText}
            onChange={(e) => setForm((f) => ({ ...f, watermarkText: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-6">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate(form)}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          {save.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </>
  )
}

export function AdminSettingsPage() {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'siteConfig'],
    queryFn: fetchAdminSiteConfig,
  })

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        description="Brand and PDF watermark text. Stored in Firestore `siteConfig/public` when Firebase is configured, with a localStorage fallback for offline editing."
      />

      {isLoading || !data ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <SettingsForm key={dataUpdatedAt} initial={data} />
      )}
    </div>
  )
}
