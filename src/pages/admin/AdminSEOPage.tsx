import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { fetchAdminSiteConfig, saveAdminSiteConfig } from '@/services/adminApi'
import type { AdminSiteConfig } from '@/types/models'

function SEOForm({ initial }: { initial: AdminSiteConfig }) {
  const qc = useQueryClient()
  const [form, setForm] = useState(initial)

  const save = useMutation({
    mutationFn: saveAdminSiteConfig,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'siteConfig'] }),
  })

  return (
    <>
      {save.isSuccess ? (
        <p className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          SEO fields saved with the shared site config document.
        </p>
      ) : null}

      <div className="max-w-2xl space-y-5 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meta description</span>
          <textarea
            value={form.metaDescription}
            onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
            rows={4}
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Meta keywords</span>
          <input
            value={form.metaKeywords}
            onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open Graph image URL</span>
          <input
            value={form.ogImageUrl}
            onChange={(e) => setForm((f) => ({ ...f, ogImageUrl: e.target.value }))}
            placeholder="https://…"
            className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-6">
        <button
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate(form)}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50"
        >
          {save.isPending ? 'Saving…' : 'Save SEO'}
        </button>
      </div>
    </>
  )
}

export function AdminSEOPage() {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'siteConfig'],
    queryFn: fetchAdminSiteConfig,
  })

  return (
    <div>
      <AdminPageHeader
        title="SEO & sharing"
        description="Default meta description and keywords for landing pages. Wire these fields into `SEOHead` or a layout provider when you centralize metadata."
      />

      {isLoading || !data ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <SEOForm key={dataUpdatedAt} initial={data} />
      )}
    </div>
  )
}
