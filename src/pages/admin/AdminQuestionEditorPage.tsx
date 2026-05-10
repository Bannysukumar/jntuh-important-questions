import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { questionSetPublicPath } from '@/lib/adminPaths'
import { unitPageKeywords } from '@/lib/seoKeywords'
import {
  adminCreateQuestionSet,
  adminSaveQuestionSet,
  computeQuestionSlug,
  fetchQuestionById,
} from '@/services/questionsApi'
import type { QuestionSet, QuestionStatus, RegulationId } from '@/types/models'

const REGS: RegulationId[] = ['r18', 'r22', 'r24']
const STATUSES: QuestionStatus[] = ['draft', 'published', 'archived']

function emptyQuestionSet(): QuestionSet {
  return {
    id: '',
    title: '',
    slug: '',
    regulation: 'r22',
    branch: '',
    year: '2nd',
    semester: '',
    subjectName: '',
    subjectCode: '',
    unitNumber: 1,
    questions: [],
    tags: [],
    keywords: [],
    createdAt: '',
    updatedAt: '',
    featured: false,
    downloadCount: 0,
    viewCount: 0,
    shareCount: 0,
    status: 'draft',
  }
}

function applySearchPrefill(base: QuestionSet, sp: Record<string, string>): QuestionSet {
  const r = sp.regulation
  if (r && (REGS as string[]).includes(r)) base.regulation = r as RegulationId
  if (sp.branch) base.branch = sp.branch
  if (sp.semester) base.semester = sp.semester
  if (sp.subjectName) base.subjectName = decodeURIComponent(sp.subjectName)
  if (sp.subjectCode) base.subjectCode = decodeURIComponent(sp.subjectCode)
  return base
}

function QuestionEditorForm({
  mode,
  initial,
  searchPrefill,
}: {
  mode: 'create' | 'edit'
  initial?: QuestionSet
  searchPrefill: Record<string, string>
}) {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [form, setForm] = useState<QuestionSet>(() => {
    if (initial) return { ...initial }
    return applySearchPrefill(emptyQuestionSet(), searchPrefill)
  })

  const [questionsText, setQuestionsText] = useState(() =>
    (initial?.questions ?? []).join('\n'),
  )
  const [tagsStr, setTagsStr] = useState(() => (initial?.tags ?? []).join(', '))
  const [keywordsStr, setKeywordsStr] = useState(() => (initial?.keywords ?? []).join(', '))

  const slugPreview = useMemo(
    () => computeQuestionSlug(form.subjectName || 'subject', Number(form.unitNumber) || 1),
    [form.subjectName, form.unitNumber],
  )

  const saveMut = useMutation({
    mutationFn: async () => {
      const questions = questionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const tags = tagsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const keywords = keywordsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const unitNumber = Math.max(1, Number(form.unitNumber) || 1)

      if (mode === 'create') {
        const newId = await adminCreateQuestionSet({
          title: form.title.trim(),
          regulation: form.regulation,
          branch: form.branch.trim(),
          year: form.year.trim(),
          semester: form.semester.trim(),
          subjectName: form.subjectName.trim(),
          subjectCode: form.subjectCode.trim(),
          unitNumber,
          questions,
          tags,
          keywords,
          pdfUrl: form.pdfUrl?.trim() || undefined,
          featured: form.featured,
          status: form.status,
          downloadCount: 0,
          viewCount: 0,
          shareCount: 0,
          createdBy: form.createdBy,
        })
        await qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
        await qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
        navigate(`/admin/questions/${newId}/edit`)
        return
      }

      await adminSaveQuestionSet({
        ...form,
        unitNumber,
        questions,
        tags,
        keywords,
        pdfUrl: form.pdfUrl?.trim() || undefined,
      })
      await qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
      await qc.invalidateQueries({ queryKey: ['admin', 'question', form.id] })
      await qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  const publicPath =
    mode === 'edit' && form.id
      ? questionSetPublicPath({
          ...form,
          slug: slugPreview,
          branch: form.branch.toLowerCase(),
        })
      : null

  return (
    <div>
      <AdminPageHeader
        title={mode === 'create' ? 'New question set' : 'Edit question set'}
        description="Slug is generated from subject name and unit number. Use draft until content is ready, then publish."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/questions"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Back to list
            </Link>
            {publicPath && form.status === 'published' ? (
              <Link
                to={publicPath}
                className="rounded-xl border border-cyan-500/40 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10"
              >
                View live page
              </Link>
            ) : null}
            <button
              type="button"
              disabled={saveMut.isPending}
              onClick={() => void saveMut.mutate()}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saveMut.isPending ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
            </button>
          </div>
        }
      />

      {saveMut.isError ? (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          Save failed. Check Firestore rules and required fields.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Routing</h3>
          <label className="block">
            <span className="text-xs text-slate-500">Regulation</span>
            <select
              value={form.regulation}
              onChange={(e) =>
                setForm((f) => ({ ...f, regulation: e.target.value as RegulationId }))
              }
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              {REGS.map((r) => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Branch code (e.g. ece, cse)</span>
            <input
              value={form.branch}
              onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Semester (e.g. 2-1)</span>
            <input
              value={form.semester}
              onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Year label</span>
            <input
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
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
            <span className="text-xs text-slate-500">Unit number</span>
            <input
              type="number"
              min={1}
              value={form.unitNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, unitNumber: Math.max(1, Number(e.target.value) || 1) }))
              }
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <p className="text-xs text-slate-500">
            Computed slug: <code className="text-cyan-400">{slugPreview}</code>
          </p>
          {mode === 'edit' ? (
            <p className="text-xs text-slate-500">
              Document id: <code>{form.id}</code>
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Content</h3>
          <label className="block">
            <span className="text-xs text-slate-500">Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Questions (one per line)</span>
            <textarea
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              rows={14}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Tags (comma-separated)</span>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>Keywords (comma-separated)</span>
              <button
                type="button"
                className="rounded-md border border-cyan-500/40 px-2 py-0.5 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/10"
                onClick={() => {
                  const u = Math.max(1, Number(form.unitNumber) || 1)
                  const suggested = unitPageKeywords({
                    regulation: form.regulation,
                    branch: (form.branch || 'ece').toLowerCase(),
                    semester: form.semester || '2-1',
                    subjectName: form.subjectName.trim() || 'Subject',
                    subjectCode: form.subjectCode.trim() || '',
                    unitNumber: u,
                  })
                  const existing = keywordsStr
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  const merged = [...new Set([...existing, ...suggested])]
                  setKeywordsStr(merged.join(', '))
                }}
              >
                Merge SEO suggestions
              </button>
            </span>
            <input
              value={keywordsStr}
              onChange={(e) => setKeywordsStr(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">PDF URL (optional)</span>
            <input
              value={form.pdfUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value || undefined }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="block">
              <span className="text-xs text-slate-500">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as QuestionStatus }))
                }
                className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2 pt-6 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="rounded border-white/20 bg-slate-950"
              />
              Featured on home
            </label>
          </div>
          {mode === 'edit' ? (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <label>
                Views
                <input
                  type="number"
                  min={0}
                  value={form.viewCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, viewCount: Number(e.target.value) || 0 }))
                  }
                  className="mt-1 w-full rounded border border-white/15 bg-slate-950 px-2 py-1 text-white"
                />
              </label>
              <label>
                Downloads
                <input
                  type="number"
                  min={0}
                  value={form.downloadCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, downloadCount: Number(e.target.value) || 0 }))
                  }
                  className="mt-1 w-full rounded border border-white/15 bg-slate-950 px-2 py-1 text-white"
                />
              </label>
              <label>
                Shares
                <input
                  type="number"
                  min={0}
                  value={form.shareCount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shareCount: Number(e.target.value) || 0 }))
                  }
                  className="mt-1 w-full rounded border border-white/15 bg-slate-950 px-2 py-1 text-white"
                />
              </label>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function AdminQuestionCreatePage() {
  const [sp] = useSearchParams()
  const searchPrefill = useMemo(() => Object.fromEntries(sp.entries()), [sp])
  return <QuestionEditorForm mode="create" searchPrefill={searchPrefill} />
}

export function AdminQuestionEditPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'question', id],
    queryFn: () => fetchQuestionById(id!),
    enabled: Boolean(id),
  })

  if (!id) return <p className="text-slate-500">Missing id.</p>
  if (isLoading) return <p className="text-slate-500">Loading…</p>
  if (isError || !data) {
    return (
      <p className="text-red-300">
        Question set not found.{' '}
        <Link to="/admin/questions" className="underline">
          Back to list
        </Link>
      </p>
    )
  }

  return <QuestionEditorForm key={data.id} mode="edit" initial={data} searchPrefill={{}} />
}
