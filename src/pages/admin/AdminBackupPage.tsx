import { useState } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { adminFetchAllComments } from '@/services/commentsApi'
import { adminListAllQuestionSets } from '@/services/questionsApi'

export function AdminBackupPage() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function exportJson() {
    setBusy(true)
    setMessage(null)
    try {
      const [questionSets, comments] = await Promise.all([
        adminListAllQuestionSets(2000),
        adminFetchAllComments(5000),
      ])
      const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        questionSets,
        comments,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jntuh-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMessage(`Exported ${questionSets.length} question sets and ${comments.length} comments.`)
    } catch {
      setMessage('Export failed. Check permissions and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Backup & restore"
        description="Download a JSON snapshot of question sets and comments. Restoring bulk data safely usually belongs in a Cloud Function or scripted migration — use this export for audits and cold storage."
        actions={
          <button
            type="button"
            disabled={busy}
            onClick={() => void exportJson()}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {busy ? 'Preparing…' : 'Download JSON backup'}
          </button>
        }
      />

      {message ? (
        <p className="mb-6 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
          {message}
        </p>
      ) : null}

      <div className="max-w-2xl space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-100/90">
        <p className="font-semibold text-amber-200">Restore checklist</p>
        <ul className="list-inside list-disc space-y-2 text-amber-100/80">
          <li>Validate JSON in a staging project before touching production.</li>
          <li>
            For Firestore, prefer the Firebase console import, migration scripts, or Admin SDK — not the browser.
          </li>
          <li>After bulk imports, re-check security rules and composite indexes.</li>
        </ul>
      </div>
    </div>
  )
}
