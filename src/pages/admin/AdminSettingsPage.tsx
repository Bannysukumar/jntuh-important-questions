import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { fetchAdminSiteConfig, saveAdminSiteConfig } from '@/services/adminApi'
import { isFirebaseConfigured } from '@/services/firebase/config'
import type { AdminSiteConfig } from '@/types/models'

function firebaseAuthMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code)
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Current password is incorrect.'
    }
    if (code === 'auth/weak-password') {
      return 'New password is too weak. Use at least 6 characters.'
    }
    if (code === 'auth/requires-recent-login') {
      return 'Please sign out and sign in again, then try changing your password.'
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Try again later.'
    }
  }
  if (err instanceof Error) return err.message
  return 'Could not update password. Try again.'
}

function hasEmailPasswordProvider(user: { providerData: { providerId: string }[] } | null): boolean {
  return Boolean(user?.providerData.some((p) => p.providerId === 'password'))
}

function AccountSecurityCard() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-slate-500">
        Firebase is not configured, so account password cannot be changed from here.
      </p>
    )
  }

  if (!user) {
    return null
  }

  if (!hasEmailPasswordProvider(user)) {
    return (
      <p className="text-sm text-slate-400">
        You are signed in with Google (or another provider without a site password). To change how you sign in, use your
        Google account security settings, or link an email/password sign-in method in Firebase Authentication.
      </p>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    setPending(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(firebaseAuthMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-6">
      {success ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Password updated.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>
      ) : null}

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">New password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm new password</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={pending || !currentPassword || !newPassword || !confirmPassword}
        className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
      >
        {pending ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}

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

      <div className="mt-14 border-t border-white/10 pt-10">
        <h2 className="text-lg font-semibold text-white">Account security</h2>
        <p className="mt-1 max-w-xl text-sm text-slate-400">
          Change the password for your Firebase email sign-in. This is the same account you use in the main app header.
        </p>
        <div className="mt-6">
          <AccountSecurityCard />
        </div>
      </div>
    </div>
  )
}
