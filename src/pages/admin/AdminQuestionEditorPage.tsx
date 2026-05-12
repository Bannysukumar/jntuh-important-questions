import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useRegulations } from '@/hooks/useRegulations'
import {
  BRANCHES,
  DEFAULT_REGULATIONS,
  inferYearLabelFromSemester,
  SEMESTERS,
  YEARS,
} from '@/lib/constants'
import { questionSetPublicPath } from '@/lib/adminPaths'
import { unitPageKeywords } from '@/lib/seoKeywords'
import {
  adminCreateQuestionSet,
  adminSaveQuestionSet,
  computeQuestionSlug,
  fetchQuestionById,
} from '@/services/questionsApi'
import type { QuestionSet, QuestionStatus, RegulationId } from '@/types/models'

const STATUSES: QuestionStatus[] = ['draft', 'published', 'archived']

const SEMESTER_OPTIONS = SEMESTERS as readonly string[]
const YEAR_OPTIONS = YEARS as readonly string[]
const BRANCH_IDS: string[] = BRANCHES.map((b) => b.id)

/** Leading list marker like `12. ` or `3) ` (requires whitespace after marker so lines like `2.0 GHz` stay intact). */
const LEADING_QUESTION_SERIAL = /^\s*\d+[\.\)]\s+/

function stripLeadingQuestionSerial(line: string): string {
  return line.replace(LEADING_QUESTION_SERIAL, '')
}

/** Non-empty lines become `1. …`, `2. …`; blank lines preserved. Existing leading serials are replaced. */
function applyQuestionSerials(raw: string): string {
  const lines = raw.split('\n')
  let n = 1
  const out: string[] = []
  for (const line of lines) {
    if (line.trim() === '') {
      out.push('')
      continue
    }
    const body = stripLeadingQuestionSerial(line).trim()
    if (body === '') {
      out.push('')
    } else {
      out.push(`${n}. ${body}`)
      n += 1
    }
  }
  return out.join('\n')
}

function normalizeQuestionsForSave(text: string): string[] {
  return text
    .split('\n')
    .map((s) => stripLeadingQuestionSerial(s).trim())
    .filter(Boolean)
}

function emptyQuestionSet(): QuestionSet {
  return {
    id: '',
    title: '',
    slug: '',
    regulation: DEFAULT_REGULATIONS.find((x) => x.id === 'r22')?.id ?? DEFAULT_REGULATIONS[0]?.id ?? 'r22',
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
    important: false,
    popular: false,
    showOnHome: true,
    downloadCount: 0,
    viewCount: 0,
    shareCount: 0,
    status: 'draft',
  }
}

function isQuestionStatus(s: string): s is QuestionStatus {
  return s === 'draft' || s === 'published' || s === 'archived'
}

function applySearchPrefill(base: QuestionSet, sp: Record<string, string>, validRegIds: string[]): QuestionSet {
  const r = sp.regulation?.toLowerCase()
  if (r && validRegIds.includes(r)) base.regulation = r as RegulationId
  if (sp.branch) base.branch = sp.branch
  if (sp.semester) base.semester = sp.semester
  if (sp.subjectName) base.subjectName = decodeURIComponent(sp.subjectName)
  if (sp.subjectCode) base.subjectCode = decodeURIComponent(sp.subjectCode)

  const yearParam = sp.year ? decodeURIComponent(sp.year).trim() : ''
  if (yearParam) {
    base.year = yearParam
  } else if (base.semester.trim()) {
    base.year = inferYearLabelFromSemester(base.semester)
  }

  if (sp.unitNumber) {
    const u = Number.parseInt(sp.unitNumber, 10)
    if (Number.isFinite(u) && u >= 1) base.unitNumber = u
  }

  if (sp.status && isQuestionStatus(sp.status)) base.status = sp.status

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
  const { regulations } = useRegulations()
  const regIds = useMemo(() => regulations.map((r) => r.id), [regulations])

  const [form, setForm] = useState<QuestionSet>(() => {
    if (initial) return { ...initial }
    return applySearchPrefill(emptyQuestionSet(), searchPrefill, DEFAULT_REGULATIONS.map((r) => r.id))
  })

  const questionsTextareaRef = useRef<HTMLTextAreaElement>(null)

  const [questionsText, setQuestionsText] = useState(() =>
    applyQuestionSerials((initial?.questions ?? []).join('\n')),
  )
  const [tagsStr, setTagsStr] = useState(() => (initial?.tags ?? []).join(', '))
  const [keywordsStr, setKeywordsStr] = useState(() => (initial?.keywords ?? []).join(', '))

  useEffect(() => {
    if (!regIds.length || regIds.includes(form.regulation)) return
    const nextReg = (regIds[0] ?? 'r22') as RegulationId
    queueMicrotask(() => setForm((f) => (f.regulation === nextReg ? f : { ...f, regulation: nextReg })))
  }, [regIds, form.regulation])

  const slugPreview = useMemo(
    () => computeQuestionSlug(form.subjectName || 'subject', Number(form.unitNumber) || 1),
    [form.subjectName, form.unitNumber],
  )

  const branchTrim = form.branch.trim()
  const branchSelectValue = BRANCH_IDS.includes(branchTrim.toLowerCase())
    ? branchTrim.toLowerCase()
    : branchTrim

  const semTrim = form.semester.trim()
  const yearTrim = form.year.trim()

  const saveMut = useMutation({
    mutationFn: async () => {
      const questions = normalizeQuestionsForSave(questionsText)
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
          important: form.important,
          popular: form.popular,
          showOnHome: form.showOnHome,
          status: form.status,
          downloadCount: 0,
          viewCount: 0,
          shareCount: 0,
          createdBy: form.createdBy,
        })
        await qc.invalidateQueries({ queryKey: ['admin', 'questionSets'] })
        await qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
        await qc.invalidateQueries({ queryKey: ['homePublishedCatalog'] })
        await qc.invalidateQueries({ queryKey: ['featured'] })
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
      await qc.invalidateQueries({ queryKey: ['homePublishedCatalog'] })
      await qc.invalidateQueries({ queryKey: ['featured'] })
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
              {regulations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Branch code (e.g. ece, cse)</span>
            <select
              value={branchSelectValue}
              onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select branch…</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label} ({b.id})
                </option>
              ))}
              {branchTrim && !BRANCH_IDS.includes(branchTrim.toLowerCase()) ? (
                <option value={branchTrim}>{branchTrim} (custom)</option>
              ) : null}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Semester (e.g. 2-1)</span>
            <select
              value={semTrim}
              onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select semester…</option>
              {SEMESTER_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              {semTrim && !SEMESTER_OPTIONS.includes(semTrim) ? (
                <option value={semTrim}>{semTrim} (custom)</option>
              ) : null}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">Year label</span>
            <select
              value={yearTrim}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">Select year…</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
              {yearTrim && !YEAR_OPTIONS.includes(yearTrim) ? (
                <option value={yearTrim}>{yearTrim} (custom)</option>
              ) : null}
            </select>
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
              ref={questionsTextareaRef}
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              onPaste={(e) => {
                const el = e.currentTarget
                const start = el.selectionStart
                const end = el.selectionEnd
                const paste = e.clipboardData.getData('text/plain')
                e.preventDefault()
                const merged = el.value.slice(0, start) + paste + el.value.slice(end)
                const numbered = applyQuestionSerials(merged)
                setQuestionsText(numbered)
                requestAnimationFrame(() => {
                  const node = questionsTextareaRef.current
                  if (!node) return
                  const pos = numbered.length
                  node.focus()
                  node.setSelectionRange(pos, pos)
                })
              }}
              onBlur={() => setQuestionsText((t) => applyQuestionSerials(t))}
              rows={14}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Paste or leave this field to number lines as 1. 2. 3. … Those prefixes are stripped on save so the public page keeps a single ordered list.
            </p>
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
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.showOnHome}
                  onChange={(e) => setForm((f) => ({ ...f, showOnHome: e.target.checked }))}
                  className="rounded border-white/20 bg-slate-950"
                />
                Show on home (branch list)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.important}
                  onChange={(e) => setForm((f) => ({ ...f, important: e.target.checked }))}
                  className="rounded border-white/20 bg-slate-950"
                />
                Important (top picks)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.popular}
                  onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
                  className="rounded border-white/20 bg-slate-950"
                />
                Popular (top picks)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="rounded border-white/20 bg-slate-950"
                />
                Featured on home
              </label>
            </div>
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
  const location = useLocation()
  const searchPrefill = useMemo(() => Object.fromEntries(sp.entries()), [sp])
  return (
    <QuestionEditorForm
      key={location.search || 'new'}
      mode="create"
      searchPrefill={searchPrefill}
    />
  )
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
