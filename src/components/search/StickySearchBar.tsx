import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BRANCHES, SEMESTERS } from '../../lib/constants'
import { useRegulations } from '@/hooks/useRegulations'
import { useSearchFilters } from '../../hooks/useSearchFilters'

const POPULAR = [
  'signals and systems',
  'data structures',
  'digital logic design',
  'probability and statistics',
  'computer organization',
  'operating systems',
]

export function StickySearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { regulations } = useRegulations()
  const { regulation, branch, semester, setRegulation, setBranch, setSemester } = useSearchFilters()
  const [q, setQ] = useState('')

  useEffect(() => {
    if (location.pathname.startsWith('/search')) {
      const sp = new URLSearchParams(location.search)
      setQ(sp.get('q') ?? '')
    } else {
      setQ('')
    }
  }, [location.pathname, location.search])

  function submit() {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (regulation) params.set('regulation', regulation)
    if (branch) params.set('branch', branch)
    if (semester) params.set('semester', semester)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="sticky top-[3.25rem] z-20 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm shadow-slate-200/40 dark:border-slate-800/90 dark:bg-slate-900/60 dark:shadow-black/30">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1 space-y-1.5">
              <label htmlFor="global-search" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Search
              </label>
              <input
                id="global-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit()
                }}
                placeholder="Subject, code, unit, or keyword…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none ring-sky-500/20 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:shadow-none dark:placeholder:text-slate-500 dark:focus:border-sky-500"
              />
            </div>
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 lg:min-w-[7.5rem]"
            >
              <svg className="h-4 w-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Regulation</span>
              <select
                value={regulation}
                onChange={(e) => setRegulation(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-sky-500/15 focus:border-sky-400 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500"
              >
                <option value="">Any regulation</option>
                {regulations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Branch</span>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-sky-500/15 focus:border-sky-400 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500"
              >
                <option value="">Any branch</option>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Semester</span>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-sky-500/15 focus:border-sky-400 focus:ring-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500"
              >
                <option value="">Any semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Popular</span>
              <div className="-mx-1 flex max-w-full flex-1 flex-wrap gap-1.5 overflow-x-auto px-1 pb-0.5 sm:flex-initial sm:overflow-visible">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQ(term)
                      const params = new URLSearchParams()
                      params.set('q', term)
                      if (regulation) params.set('regulation', regulation)
                      if (branch) params.set('branch', branch)
                      if (semester) params.set('semester', semester)
                      navigate(`/search?${params.toString()}`)
                    }}
                    className="whitespace-nowrap rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-sky-500/40 dark:hover:bg-sky-500/10 dark:hover:text-sky-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
